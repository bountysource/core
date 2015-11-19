# == Schema Information
#
# Table name: fundraiser_tracker_relations
#
#  id            :integer          not null, primary key
#  fundraiser_id :integer          not null
#  tracker_id    :integer          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_fundraiser_tracker_relations_on_ids  (fundraiser_id,tracker_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :fundraiser_tracker_relation do
    association :tracker, factory: :tracker
    association :fundraiser, factory: :fundraiser
  end
end
