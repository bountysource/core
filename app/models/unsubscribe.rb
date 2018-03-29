# == Schema Information
#
# Table name: unsubscribes
#
#  id                :integer          not null, primary key
#  person_id         :integer
#  linked_account_id :integer
#  email             :string(255)
#  category          :string(255)
#  created_at        :datetime
#  updated_at        :datetime
#
# Indexes
#
#  index_unsubscribes_on_email              (email)
#  index_unsubscribes_on_linked_account_id  (linked_account_id)
#  index_unsubscribes_on_person_id          (person_id)
#

class Unsubscribe < ApplicationRecord
  belongs_to :person
  belongs_to :linked_account, class_name: 'LinkedAccount::Base'

  validates :category, format: { with: /\A(all|product_updates|proposals|bounty_alerts|bounty_alerts_tracker_\d+|team_updates|team_updates_\d+)\z/ }

  scope :where_object, lambda { |object|
    # matchers
    emails = []
    linked_account_ids = []
    person_ids = []

    # initial ids
    emails << object if object.is_a?(String)
    person_ids << object.id if object.is_a?(Person)
    linked_account_ids << object.id if object.is_a?(LinkedAccount::Base)

    # keep looping through until we've discovered all possible identifiers OBJECT has
    loop do
      # keep track of when we can stop
      total_length_before = emails.length + person_ids.length + linked_account_ids.length
      raise "Object not recognized: #{object.class.name}" if total_length_before == 0

      emails += Person.where(id: person_ids).pluck(:email) unless person_ids.empty?
      emails += LinkedAccount::Base.where(id: linked_account_ids).pluck(:email).compact unless linked_account_ids.empty?
      emails = emails.uniq.compact.reject { |e| e.blank? || !e['@'] }

      linked_account_ids += LinkedAccount::Base.where(person_id: person_ids).pluck(:id) unless person_ids.empty?
      linked_account_ids += LinkedAccount::Base.where(email: emails).pluck(:id) unless emails.empty?
      linked_account_ids = linked_account_ids.uniq.compact

      person_ids += Person.where(email: emails).pluck(:id) unless emails.empty?
      person_ids += LinkedAccount::Base.where(email: emails).pluck(:person_id) unless emails.empty?
      person_ids += LinkedAccount::Base.where(id: linked_account_ids).pluck(:person_id) unless linked_account_ids.empty?
      person_ids = person_ids.uniq.compact

      # break we discovered everything
      break if total_length_before == emails.length + person_ids.length + linked_account_ids.length
    end

    # add params into where
    where_str = []
    where_params = []
    if emails.length > 0
      where_str << 'email in (?)'
      where_params << emails
    end
    if person_ids.length > 0
      where_str << 'person_id in (?)'
      where_params << person_ids
    end
    if linked_account_ids.length > 0
      where_str << 'linked_account_id in (?)'
      where_params << linked_account_ids
    end
    where_params.unshift(where_str.join(' OR '))

    # return scope for Unsubscribe
    where(*where_params)
  }

  scope :where_category, lambda { |categories|
    where(category: categories.flatten.compact.map(&:to_s).uniq)
  }


  # shortcut:
  # - Unsubscribe.d?(Person.first, 'team_update', 'team_update_123')
  # - Unsubscribe.d?(LinkedAccount::Github::User.first, 'all')
  # - Unsubscribe.d?("foo@bar.com", 'newsletters')
  def self.d?(object, *categories)
    Unsubscribe.where_object(object).where_category(categories).exists?
  end

  def self.for(object)
    Unsubscribe.where_object(object).pluck(:category)
  end

  def self.object_to_token(obj)
    if obj.is_a?(Person)
      "person:#{Digest::SHA256.hexdigest("#{Api::Application.config.unsubscribe_secret}-person-#{obj.id}").first(10)}:#{obj.id}"
    elsif obj.is_a?(LinkedAccount::Base)
      "linked:#{Digest::SHA256.hexdigest("#{Api::Application.config.unsubscribe_secret}-linked-#{obj.id}").first(10)}:#{obj.id}"
    elsif obj.is_a?(String)
      "email:#{Digest::SHA256.hexdigest("#{Api::Application.config.unsubscribe_secret}-email-#{obj.id}").first(10)}:#{obj}"
    end
  end

  def self.token_to_object(token)
    # allow plain email addresses to match for a few more months, then signatures are required
    # TODO: if it's after 2016-01-1, you can delete this
    if Time.now < Time.parse('2016-01-01') && !(token.match(/^(email|person|linked):/)) && (person=Person.where(email: token).first)
      return person
    end

    type, sig, rest = token.split(':',3)
    if type == 'person'
      obj = Person.active.find(rest)
    elsif type == 'linked'
      obj = LinkedAccount::Base.find(rest)
    else
      obj = rest
    end

    # token matches?
    object_to_token(obj) == token ? obj : nil
  end

end
