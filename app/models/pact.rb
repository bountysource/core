# == Schema Information
#
# Table name: pacts
#
#  id                  :bigint(8)        not null, primary key
#  project_name        :string
#  type                :string
#  experience_level    :string
#  time_commitment     :string
#  issue_type          :string
#  expires_at          :datetime
#  paid_at             :datetime
#  link                :string
#  issue_url           :string
#  project_description :string
#  amount              :decimal(10, 2)   not null
#  person_id           :integer
#  owner_type          :string
#  owner_id            :integer
#  featured            :boolean          default(FALSE), not null
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#

class Pact < ApplicationRecord
  belongs_to :person

  has_many :splits, :as => :item
  has_many :txns, :through => :splits

  has_owner

  validates :amount, numericality: { greater_than_or_equal_to: 5 }

  module Status
    ACTIVE = 'active'
    REFUNDED = 'refunded'
    PAID = 'paid'

    def self.all
      [ACTIVE, REFUNDED, PAID]
    end
  end

  validates :status, inclusion: { in: Status.all }

  scope :active, lambda { where(status: Status::ACTIVE) }

  scope :refunded, lambda { where(status: Status::REFUNDED) }
  scope :paid, lambda { where(status: Status::PAID) }
  scope :not_refunded, lambda { where("status != :status", status: Status::REFUNDED) }

  scope :expiring_soon,       lambda { |date=2.weeks.from_now, count=nil| where('expires_at < ?', date).order('expires_at desc').limit(count) }
end
