# == Schema Information
#
# Table name: activity_logs
#
#  id         :integer          not null, primary key
#  person_id  :integer
#  issue_id   :integer
#  tracker_id :integer          not null
#  name       :string(255)      not null
#  created_at :datetime         not null
#  lurker_id  :integer
#
# Indexes
#
#  index_activity_logs_on_created_at  (created_at)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :activity_log do
    association :person, factory: :person
    association :tracker, factory: :tracker
    association :issue, factory: :issue
  end
end
