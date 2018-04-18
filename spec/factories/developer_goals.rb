# == Schema Information
#
# Table name: developer_goals
#
#  id         :integer          not null, primary key
#  notified   :boolean          default(FALSE)
#  amount     :integer          not null
#  person_id  :integer          not null
#  issue_id   :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_developer_goals_on_issue_id                (issue_id)
#  index_developer_goals_on_person_id               (person_id)
#  index_developer_goals_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

FactoryBot.define do
  factory :developer_goal, class: DeveloperGoal do
    amount 100
    association :person, factory: :person
    association :issue, factory: :issue
  end
end
