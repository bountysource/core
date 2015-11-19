# == Schema Information
#
# Table name: rewards
#
#  id                  :integer          not null, primary key
#  fundraiser_id       :integer          not null
#  description         :text             not null
#  delivered_at        :datetime
#  limited_to          :integer
#  timezone            :string(255)
#  vanity_url          :string(255)
#  created_at          :datetime         not null
#  updated_at          :datetime         not null
#  amount              :integer
#  sold_out            :boolean          default(FALSE)
#  fulfillment_details :text
#  merchandise_fee     :decimal(10, 2)
#
# Indexes
#
#  index_rewards_on_sold_out  (sold_out)
#

class Reward < ActiveRecord::Base

  # ATTRIBUTES
  attr_accessible :fundraiser, :delivered_at, :description, :limited_to, :claimed, :timezone, :vanity_url, :amount,
                  :sold_out, :fulfillment_details, :merchandise_fee

  # RELATIONSHIPS
  belongs_to :fundraiser
  has_many :pledges

  # VALIDATIONS
  validates :amount,
            presence: true,
            numericality: { greater_than: 0 }

  validates :description,
            presence: true

  default_scope lambda { order("rewards.amount asc") }
  scope :merchandise, lambda { where('rewards.merchandise_fee IS NOT NULL') }
  scope :non_zero, lambda { where('rewards.amount >0') }

  # don't allow the zero reward to be changed
  before_update do
    if amount_was.zero?
      errors.add :base, "Cannot change 'No Reward'"
      false
    end
  end

  before_destroy do
    errors.add :base, "Cannot delete 'No Reward' option" if amount.zero?
    errors.add :base, "Cannot delete published reward" if fundraiser.published?
    errors.empty?
  end

  class RewardUpdateValidator < ActiveModel::Validator
    def validate(record)
      if record.fundraiser.published?
        record.errors.add :amount,       "cannot be changed" if record.amount_changed?
        record.errors.add :description,  "cannot be changed" if record.description_changed?
      end
    end
  end
  validates_with RewardUpdateValidator, on: :update

  class SoldOut < StandardError; end

  # when claimed from a pledge, update claimed
  def claim!
    return true unless limited_to? && limited_to > 0

    if sold_out?
      raise SoldOut, "There are no more of these rewards left"
    else
      self.sold_out = claimed == limited_to
      self.save!
    end
  end

  def claimed
    pledges.where('reward_id = ?', id).count
  end
end
