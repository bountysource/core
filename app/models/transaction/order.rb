# == Schema Information
#
# Table name: transactions
#
#  id                 :integer          not null, primary key
#  description        :text
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  audited            :boolean
#  type               :string(255)      default("Transaction"), not null
#  person_id          :integer
#  checkout_method_id :integer
#  gross              :decimal(, )
#  items              :decimal(, )
#  fee                :decimal(, )      default(0.0)
#  processing_fee     :decimal(, )      default(0.0)
#  merch_fee          :decimal(, )      default(0.0)
#  liability          :decimal(, )      default(0.0)
#
# Indexes
#
#  index_transactions_on_checkout_method_id  (checkout_method_id)
#  index_transactions_on_fees                (fee)
#  index_transactions_on_gross               (gross)
#  index_transactions_on_items               (items)
#  index_transactions_on_liability           (liability)
#  index_transactions_on_merch_fee           (merch_fee)
#  index_transactions_on_person_id           (person_id)
#  index_transactions_on_processing_fee      (processing_fee)
#

class Transaction::Order < Transaction

  class Error < StandardError ; end
  class CartEmpty < Error ; end
  class InvalidCheckoutMethod < Error ; end

  # Uses the new PaymentNotification model for improved verification + race condition guard
  def self.create_from_payment_notification(notification: nil, notification_id: nil)
    payment_notification = notification || PaymentNotification.find_by(id: notification_id)
    return nil unless payment_notification && payment_notification.verified?

    ShoppingCart.transaction do
      # load the cart
      cart = payment_notification.shopping_cart

      # Raise if the cart has already been purchased
      return cart.order if cart.order.present?

      # If you do not lock this row, you will get duplicate Transactions.
      cart = cart.lock!

      # Infer checkout method from PaymentNotification type
      checkout_method = payment_notification.checkout_method

      order = create_from_cart_and_checkout_method cart, checkout_method, source: payment_notification

      payment_notification.update_attribute :order, order

      return order
    end
  end

  # Given a ShoppingCart, create a Transaction for all items in a shopping cart.
  # Make sure you don't trigger this until payment POST back, or equivalent verification.
  # On Transaction, there will be:
  # * ONE split from checkout_method for sum of item gross'
  # * for each item:
  #   * ONE split to item account
  #   * ZERO or ONE split to fee account, depending on checkout_method
  def self.create_from_cart_and_checkout_method(cart, checkout_method, options={})
    raise CartEmpty if cart.items.empty?
    raise InvalidCheckoutMethod, checkout_method.class.name unless valid_checkout_method?(checkout_method)

    # Optionally, a source can be passed in to update Splits on the Transaction with an item.
    # If left nil, then the Splits will not have an item.
    source = options[:source]

    # List of items that are created through checkout.
    # Saved in array so that we can invoke callbacks AFTER the transaction... transaction block is finished
    created_items = []
    order = nil

    cart_liability = cart.calculate_liability
    cart_gross = cart.calculate_gross

    liability_account = Account::Liability.instance

    ActiveRecord::Base.transaction do

      # Ensure that the cart has not yet been processed
      # TODO this overlaps a bit with the ::create_from_payment_notification,
      # which only deals with Paypal at the moment. Google Wallet should
      # be updated to use PaymentNotification at some point. Perhaps all of this
      # will be replaced with the Checkout class when that is finished:
      # https://github.com/bountysource/api/tree/cory/checkout_cleanup
      return cart.order if cart.order.present?
      cart.lock!

      # Create the Transaction
      order = create!(
        audited: true,
        person: cart.person,
        checkout_method: checkout_method,
        gross: cart_gross,
        liability: cart_liability
      )

      # Create item and fee splits for each item
      cart.items.each do |item_attributes|
        item = cart.item_from_attributes(item_attributes)

        # Add Person if missing from item.
        item.person = cart.person if item.respond_to?(:person=) && !item.person

        # Time to create that item! Save it to add Item IDs to description later
        item.save! and created_items << item

        order.splits.create!(
          amount: item.amount,
          item: item
        )
      end

      # Take money from payment source
      order.splits.create!(
        amount: -1 * cart.calculate_gross,
        account: payment_source(checkout_method),
        item: source
      )

      # Split imbalance should be the amount of upsells (Bounty tweet).
      # Create a Split reducing out liability
      imbalance = order.splits.sum(:amount).abs
      if imbalance > 0
        order.splits.create!(
          amount: imbalance,
          account: liability_account
        )
      end

      # Normalize the dates of Transaction and its Splits.
      order.update_attribute(:created_at, DateTime.now)
      order.splits.update_all(created_at: order.created_at)

      # Set description with Transaction subclass name
      lines = ["gross: #{Money.new(cart_gross * 100)}"]
      lines << "order_id: #{source.order_id}" if source && source.is_a?(GoogleWalletItem)
      lines << "txn_id: #{source.txn_id}" if source && source.is_a?(PaypalIpn)
      lines << "items: [#{created_items.map { |i| "#{i.class.name}(#{i.id})" }.join(', ')}]" unless created_items.empty?

      # Update with description and run Transaction validations
      order.update_attributes!(description: "#{name}(#{order.id}) #{ lines.join(' - ') }")

      # save order_id on cart
      cart.order ||= order
      cart.status = 'paid'
      cart.save! if cart.changed?

      # And, last but not least, give the person a new cart
      cart.replace! unless options[:dont_touch_cart]
    end

    # Invoke after_purchase callbacks after the order is successfully saved.
    # TODO Run this in the background? The results might be depended upon for the receipt page.
    created_items.each { |item| item.after_purchase(order) if item.respond_to?(:after_purchase) }

    order
  end

  def self.escrow_account
    raise NotImplemented
  end

  def self.merch_sales
    BigDecimal.new( joins(:splits).where('splits.account_id = ?', Account::BountySourceMerch.instance.id).sum('splits.amount') )
  end

  def self.bounty_sales
    fees = BigDecimal.new( joins(:splits).where('splits.account_id = ?', Account::BountySourceFeesBounty.instance.id).sum('splits.amount') )
    bounty = BigDecimal.new( joins(:splits => [:account]).where('accounts.type = ?', 'Account::IssueAccount').sum('splits.amount') )
    fees + bounty
  end

  def self.pledge_sales
    fees = BigDecimal.new( joins(:splits).where('splits.account_id = ?', Account::BountySourceFeesPledge.instance.id).sum('splits.amount') )
    pledge = BigDecimal.new( joins(:splits => [:account]).where('(select type from accounts where id = splits.account_id) = ?', 'Account::Fundraiser').sum('splits.amount') )
    fees + pledge
  end

  def self.team_sales
    fees = BigDecimal.new( joins(:splits).where('splits.account_id = ?', Account::BountySourceFeesTeam.instance.id).sum('splits.amount') )
    team = BigDecimal.new( joins(:splits => [:account]).where('(select type from accounts where id = splits.account_id) LIKE ?', 'Account::Team%').sum('splits.amount') )
    fees + team
  end

  def self.gross_sales
    bounty_sales + pledge_sales + merch_sales
  end

  def self.bounty_liability
    BigDecimal.new( joins(:splits => [:account]).where('accounts.type = ?', 'Account::IssueAccount').sum('splits.amount') )
  end

  def self.pledge_liability
    BigDecimal.new( joins(:splits => [:account]).where('accounts.type = ?', 'Account::Fundraiser').sum('splits.amount') )
  end

  def self.team_liability
    BigDecimal.new( joins(:splits => [:account]).where('accounts.type LIKE ?', 'Account::Team%').sum('splits.amount') )
  end

  def self.gross_liability
    bounty_liability + pledge_liability + team_liability
  end

  def self.processing_fees
    processing_fees_account = Account::BountySourceFeesPayment.instance
    joins(:splits => [:account]).where('splits.account_id = ?', processing_fees_account.id).group('transactions.id, splits.transaction_id').select('MIN(splits.amount) as processing_fees').sum do |result|
      BigDecimal.new(result.processing_fees)
    end
  end

protected

  def self.valid_checkout_methods
    [
      ::Account::Personal,
      ::Account::Team,
      ::Account::GoogleWallet,
      ::Account::Paypal,
      ::Account::Coinbase,
      ::Account::PaymentMethod
    ]
  end

  # Is this an acceptable checkout method? These are all Account models
  def self.valid_checkout_method?(checkout_method)
    !!valid_checkout_methods.find { |klass| checkout_method.is_a?(klass) }
  end

  # Does creating an order with this checkout method create new Liability?
  def self.creates_liability?(account)
    account.is_a?(Account::Paypal) ||
      account.is_a?(Account::GoogleWallet) ||
      account.is_a?(Account::Coinbase)
  end

  # Determine payment source for checkout_method.
  # If internal account, return checkout_method. Otherwise, return Account::Liability instance.
  # @return Account instance.
  def self.payment_source(checkout_method)
    creates_liability?(checkout_method) ? Account::Liability.instance : checkout_method
  end

end
