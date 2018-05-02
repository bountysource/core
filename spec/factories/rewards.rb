# == Schema Information
#
# Table name: rewards
#
#  id                  :integer          not null, primary key
#  fundraiser_id       :integer          not null
#  description         :text             not null
#  delivered_at        :datetime
#  limited_to          :integer
#  timezone            :string
#  vanity_url          :string
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

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :reward, class: Reward do
    association :fundraiser, factory: :fundraiser
    amount 10
    description "I will give you a hug"
  end
end
