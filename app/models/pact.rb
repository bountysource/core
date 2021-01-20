# == Schema Information
#
# Table name: pacts
#
#  id                  :bigint(8)        not null, primary key
#  project_name        :string
#  pact_type           :string
#  experience_level    :string
#  time_commitment     :string
#  issue_type          :string
#  expires_at          :datetime
#  paid_at             :datetime
#  link                :string
#  issue_url           :string
#  project_description :string
#  bounty_total        :decimal(10, 2)   default(0.0), not null
#  person_id           :integer
#  owner_type          :string
#  owner_id            :integer
#  featured            :boolean          default(FALSE), not null
#  can_add_bounty      :boolean          default(TRUE), not null
#  solution_started    :boolean          default(FALSE), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  completed_at        :datetime
#

class Pact < ApplicationRecord
  enum category: [:fiat]
  belongs_to :person

  has_many :bounties
  has_many :bounty_claims

  has_owner

  # module Status
  #   ACTIVE = 'active'
  #   REFUNDED = 'refunded'
  #   PAID = 'paid'

  #   def self.all
  #     [ACTIVE, REFUNDED, PAID]
  #   end
  # end

  # validates :status, inclusion: { in: Status.all }

  # scope :active, lambda { where(status: Status::ACTIVE) }

  # scope :refunded, lambda { where(status: Status::REFUNDED) }
  # scope :paid, lambda { where(status: Status::PAID) }
  # scope :not_refunded, lambda { where("status != :status", status: Status::REFUNDED) }

  # scope :expiring_soon,       lambda { |date=2.weeks.from_now, count=nil| where('expires_at < ?', date).order('expires_at desc').limit(count) }

  def backers
    fiat_backers = bounties.pluck(:person_id).uniq
    Person.where(id: fiat_backers.uniq)
  end

  def can_respond_to_claims?(person)
    Ability.new(person).can?(:respond_to_claims, self)
  end
end
