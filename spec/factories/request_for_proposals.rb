# == Schema Information
#
# Table name: request_for_proposals
#
#  id         :integer          not null, primary key
#  issue_id   :integer
#  budget     :decimal(10, 2)
#  due_date   :date
#  created_at :datetime
#  updated_at :datetime
#  person_id  :integer          not null
#  state      :string           default("pending")
#  abstract   :string(1000)
#
# Indexes
#
#  index_request_for_proposals_on_budget     (budget)
#  index_request_for_proposals_on_issue_id   (issue_id)
#  index_request_for_proposals_on_person_id  (person_id)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :request_for_proposal do
    association :person, factory: :person
    association :issue, factory: :issue
    budget 100
    due_date DateTime.now
    abstract "I want you to do this for me. Are you a bad enough dude to rescue the president?"
  end
end
