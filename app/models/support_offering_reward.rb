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

class SupportOfferingReward < ActiveRecord::Base
  scope :active, lambda { where(deleted_at: nil) }

  belongs_to :support_offering
  has_many :support_levels, foreign_key: :reward_id

  def mark_as_deleted!
    update_attributes(deleted_at: Time.now)
    #TODO: email people who have this reward and tell 'em it doesn't exist anymore
  end

  def update_from_params!(params)
    if active_support_levels_count > 0
      raise "Can't modify active rewards"
    else
      update_attributes!(params.slice(:amount, :title, :description))
    end
  end

  def update_counter!
    update_attributes!(active_support_levels_count: support_levels.active.count)
  end
end
