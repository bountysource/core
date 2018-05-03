# == Schema Information
#
# Table name: shopping_carts
#
#  id                :integer          not null, primary key
#  person_id         :integer
#  items             :text             default([]), not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  order_id          :integer
#  uid               :string(255)
#  payment_method_id :integer
#  status            :text             default("draft"), not null
#
# Indexes
#
#  index_shopping_carts_on_order_id  (order_id)
#  index_shopping_carts_on_status    (status)
#  index_shopping_carts_on_uid       (uid)
#

class ShoppingCart < ApplicationRecord
  # STATUS = %w(draft open paid unpaid)

  belongs_to :person
  # NOTE: specifying class_name transaction::order is more correct but doesn't work in dev mode because of auto-const-loading
  belongs_to :order, class_name: 'Transaction' #, class_name: 'Transaction::Order'
  belongs_to :payment_method
  serialize :items, JSON

  scope :ready_to_be_billed, lambda { where(status: 'open') }

  class Error < StandardError ; end
  class InvalidItem < Error ; end
  class OrderAlreadyProcessed < Error ; end

  # don't allow updating a cart that's already been processed
  before_update do |record|
    raise OrderAlreadyProcessed unless record.order_id_was.nil?
  end

  # Add item to the cart
  def add_item attrs
    item = item_from_attributes(attrs)
    raise ActiveRecord::RecordInvalid, item unless item && item_is_valid?(item)
    update_attribute :items, items.unshift(attrs)
    item
  end

  # Update the item at index with attrs
  def update_item(index, attrs)
    new_items = items
    new_items[index] = new_items[index].merge(attrs)
    item = item_from_attributes(new_items[index])
    raise ActiveRecord::RecordInvalid, item unless item && item_is_valid?(item)
    update_attribute :items, new_items
    item
  end

  # Remove an item from the cart
  def remove_item(index)
    new_items = items

    # TODO cleanse. this is shameful
    item = load_item_at(index)
    item.reverse_appointment! if item.is_a?(Proposal)

    new_items.delete_at(index)
    update_attribute :items, new_items
  end

  def item_at(index)
    items.fetch(index)
  end

  def load_item_at(index)
    item_from_attributes(item_at(index))
  end

  # Instantiate items and return in array.
  def load_items
    items.map { |serialized_item| item_from_attributes(serialized_item) }.compact
  end

  # Create new ShoppingCart for Person, but do not delete the old one.
  def replace!
    self.class.transaction do
      person.update_attribute :shopping_cart_id, nil
      person.shopping_cart # autocreates shopping cart
    end
  end

  # Remove all items from cart
  def clear
    update_attribute :items, []
  end

  # Are there no items in the cart?
  def empty?
    items.empty?
  end

  # Are there items in the cart?
  def present?
    items.present?
  end

  # How to cart with PayPal https://www.paypal.com/cgi-bin/webscr?cmd=_pdn_howto_checkout_outside#methodtwo
  def create_paypal_checkout_url
    gross = calculate_gross

    options = {
      amount: gross.to_s,
      item_name: "Bountysource Order ##{id}",
      item_number: id,

      cmd: '_xclick',
      # cmd: '_cart', # uncomment to enable items on paypal checkout page
      # upload: '1', # uncomment if cmd: _cart

      notify_url: Api::Application.config.paypal[:notify_url],
      return: Api::Application.config.paypal[:return_url],

      business: Api::Application.config.paypal[:email],
      no_shipping: '1',
      no_note: '1'
    }

    ## Append item info if using cmd: _cart
    #load_items.each_with_index do |item, i|
    #  item_amounts = Transaction::Order.amounts_for_item(item, Account::Paypal.instance)
    #
    #  options.merge!(
    #    "item_name_#{i+1}" => self.class.item_display_name(item),
    #    "amount_#{i+1}" => Money.new(item_amounts.item * 100).to_s,
    #    "handling_#{i+1}" => Money.new(item_amounts.fee * 100).to_s
    #  )
    #end

    "#{Api::Application.config.paypal[:checkout_url]}cgi-bin/webscr?#{options.to_param}"
  end

  # Sum gross of items
  def calculate_gross
    items.sum { |item_attributes| calculate_item_gross(item_attributes) }
  end

  # TODO: no floats anywhere...
  def calculate_gross_money
    Money.new(calculate_gross * 100, 'USD')
  end

  # Calculate gross for item in USD
  # @param upsells - includeu upsells in the calculation
  def calculate_item_gross(attrs, upsells: true)
    attrs["total"].to_f || attrs["amount"].to_f
  end

  # Sum liability of items
  def calculate_liability
    calculate_gross
  end

  # Calculate liability created by item in USD.
  # If it's an internal transfer, there is no liability, returns 0.
  def calculate_item_liability(item_attributes)
    calculate_item_gross(item_attributes)
  end

  # Merge two shopping carts.
  # Doesn't care if there are duplicate items.
  def merge!(other)
    update_attributes items: items + other.items
    other.destroy! and self
  end

  def amount_from_attributes(attrs)
    attrs[:total].to_f || attrs[:amount].to_f
  end

  def item_from_attributes(attrs)
    attrs = attrs.with_indifferent_access

    # Instantiate item by safely constantizing class
    klass = self.class.constantize_item_type(attrs[:item_type])

    # TODO cleanse. this is the worst
    return proposal_from_attrs(attrs) if klass == Proposal

    return nil unless klass

    item = klass.new

    case item
    when Bounty
      item.assign_attributes attrs.select { |k,v| WHITELISTED_BOUNTY_ATTRIBUTES.include? k.to_sym }.with_indifferent_access
      item.issue = ::Issue.find_by id: attrs[:issue_id]

    when Pledge
      item.assign_attributes attrs.select { |k,v| WHITELISTED_PLEDGE_ATTRIBUTES.include? k.to_sym }
      item.fundraiser = ::Fundraiser.find_by id: attrs[:fundraiser_id]

    when TeamPayin
      item.assign_attributes attrs.select { |k,v| WHITELISTED_TEAM_PAYIN_ATTRIBUTES.include? k.to_sym }.with_indifferent_access
      item.team = ::Team.find_by(id: attrs[:team_id]) || ::Team.find_by(slug: attrs[:team_id])

    when SupportLevelPayment
      item.assign_attributes attrs.select { |k,v| WHITELISTED_SUPPORT_LEVEL_ATTRIBUTES.include? k.to_sym }.with_indifferent_access
      item.support_level = ::SupportLevel.find_by(id: attrs[:support_level_id])

    when IssueSuggestionReward
      # NOTE: no whitelist attributes
      item.issue_suggestion = ::IssueSuggestion.where(id: attrs[:issue_suggestion_id], team_id: person.admin_team_ids).first

    end

    # Set amount with currency conversion if amount is present.
    # Items can be added to the cart with no amount, for example,
    # clicking the huge "Pledge Now" button on a fundraiser
    item.amount = amount_from_attributes(attrs)

    # Assign person id if user authenticated
    item.person = person if item.respond_to?(:person=) # optional

    item
  end

  # TODO This is the wost
  def proposal_from_attrs(attrs)
    Proposal.find_by(id: attrs[:proposal_id])
  end

  def item_is_valid?(item)
    # Add error if item is saved. Don't add a error if the item is a Prosal. This item will be created before its added to the cart.
    unless item.new_record? || item.is_a?(Proposal) || item.is_a?(IssueSuggestion)
      errors.add(:base, "Item is saved #{item.class}(#{item.id})")
    end

    # Run validations
    item.valid?

    # Do not validate amount
    item.errors.delete(:amount)

    item.errors.empty?
  end

  # Find or create ShoppingCart. Handles merging of anonymous carts into authenticated carts,
  # refer to the spec for some examples.
  def self.find_or_create(uid: nil, person: nil, autocreate: true)
    # Only compare against unprocessed carts.
    # When an order is processed, the old cart is saved and is updated with order_id.
    # The cookie on the frontend still references the processed cart, and the old items from it
    # would be erroneously merged into the newly created cart.
    anonymous_cart = ShoppingCart.where('order_id IS NULL').find_by uid: uid

    # Find Person shopping cart, if :person present and has a ShoppingCart
    person_cart = ShoppingCart.find_by(id: person.try(:shopping_cart_id))

    if anonymous_cart && !person_cart
      # Associate local cart with Person if :person is present and they do not have a shopping cart
      if person && person.shopping_cart_id.nil?
        person.update_attribute :shopping_cart_id, anonymous_cart.id
      end

      return anonymous_cart

    elsif !anonymous_cart && person_cart
      return person_cart

    elsif anonymous_cart && person_cart
      # Merge other cart into person's cart if they are different instances.
      unless anonymous_cart == person_cart
        person_cart.merge! anonymous_cart
      end

      # Update cart with person_id if it's null...
      # TODO simplify ShoppingCart relation to Person and this goes away
      if person && person_cart.person.blank?
        person_cart.update_attribute(:person_id, person.id)
      end

      return person_cart

    elsif !anonymous_cart && !person_cart
      # Raise not found if autocreate is false, renders 404
      raise ActiveRecord::RecordNotFound unless autocreate

      return person.is_a?(Person) ? person.shopping_cart : ShoppingCart.create
    end
  end

  # Calculate
  def split_amount_for_item(item_attributes, checkout_method)
    calculate_item_gross(item_attributes, upsells: true)
  end

private

  def self.constantize_item_type(item_type = nil)
    return nil unless item_type

    case item_type.underscore
    when 'pledge'
      Pledge

    when 'bounty'
      Bounty

    when 'team_payin'
      TeamPayin

    when 'proposal'
      Proposal

    when 'support_level_payment'
      SupportLevelPayment

    when 'issue_suggestion_reward'
      IssueSuggestionReward
    end
  end

  WHITELISTED_ATTRIBUTES            = [:amount, :owner_id, :owner_type]
  WHITELISTED_BOUNTY_ATTRIBUTES     = [:anonymous, :issue_id, :bounty_expiration, :upon_expiration, :promotion, :tweet] + WHITELISTED_ATTRIBUTES
  WHITELISTED_PLEDGE_ATTRIBUTES     = [:anonymous, :fundraiser_id, :reward_id, :survey_response] + WHITELISTED_ATTRIBUTES
  WHITELISTED_TEAM_PAYIN_ATTRIBUTES = [:team_id] + WHITELISTED_ATTRIBUTES
  WHITELISTED_SUPPORT_LEVEL_ATTRIBUTES = [:amount, :support_level_id, :period_starts_at, :period_ends_at]
  WHITELISTED_ISSUE_SUGGESTION_REWARD_ATTRIBUTES = [:amount, :issue_suggestion_id]

  # Create a hash of attributes from an item instance
  def self.item_to_attributes item
    attrs = {
      item_type: item.class.name.underscore,
      currency: 'USD'
    }

    case item
    when Bounty
      attrs.merge!(item.attributes.select { |k,_| WHITELISTED_BOUNTY_ATTRIBUTES.include? k.to_sym })

    when Pledge
      attrs.merge!(item.attributes.select { |k,_| WHITELISTED_PLEDGE_ATTRIBUTES.include? k.to_sym })

    when TeamPayin
      attrs.merge!(item.attributes.select { |k,_| WHITELISTED_TEAM_PAYIN_ATTRIBUTES.include? k.to_sym })

    when SupportLevelPayment
      attrs.merge!(item.attributes.select { |k,_| WHITELISTED_SUPPORT_LEVEL_ATTRIBUTES.include? k.to_sym })

    when Proposal
      # Proposals are already created objects.
      attrs.merge!(item.attributes)
      # proposal_from_attrs finds Proposal using `proposal_id`.
      # This is necessary because the update action uses an `id`
      # for cart_item indexing. ie. Determining which item to update in an array of cart_items
      id_value = attrs.delete('id')
      attrs[:proposal_id] = id_value

    when IssueSuggestionReward
      attrs.merge!(item.attributes.select { |k,_| WHITELISTED_ISSUE_SUGGESTION_REWARD_ATTRIBUTES.include? k.to_sym })

    end

    attrs.with_indifferent_access
  end

  # Generate display name for an item
  def self.item_display_name(item)
    case item
    when Pledge
      "$#{item.amount.to_i} Pledge to #{item.fundraiser.title}"

    when Bounty
      "$#{item.amount.to_i} Bounty on #{item.issue.tracker.name}"

    when TeamPayin
      "$#{item.amount.to_i} Pledge to #{item.team.display_name}"

    when SupportLevelPayment
      "$#{item.amount.to_i} Support for #{item.support_level.team.display_name}"
    end
  end

end
