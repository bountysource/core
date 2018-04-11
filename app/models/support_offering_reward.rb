# == Schema Information
#
# Table name: support_offering_rewards
#
#  id                          :integer          not null, primary key
#  support_offering_id         :integer          not null
#  amount                      :decimal(10, 2)   not null
#  title                       :string(255)
#  description                 :text
#  active_support_levels_count :integer          default(0), not null
#  deleted_at                  :datetime
#  created_at                  :datetime
#  updated_at                  :datetime
#
# Indexes
#
#  index_support_offering_rewards_on_support_offering_id  (support_offering_id)
#

class SupportOfferingReward < ApplicationRecord
  scope :active, lambda { where(deleted_at: nil) }

  belongs_to :support_offering
  has_many :support_levels, foreign_key: :reward_id

  validates :amount, :numericality => { :greater_than_or_equal_to => 0 }
  validate :non_active
  validates :title, presence: true

  def mark_as_deleted!
    update_attributes(deleted_at: Time.now)
    #TODO: email people who have this reward and tell 'em it doesn't exist anymore
  end

  def update_counter!
    update_attributes!(active_support_levels_count: support_levels.active.count)
  end

  private
    def non_active
      if active_support_levels_count > 0
        errors.add(:active_support_levels_count, "Can't modify active rewards")
      end
    end
end
