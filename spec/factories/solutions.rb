# == Schema Information
#
# Table name: solutions
#
#  id              :integer          not null, primary key
#  person_id       :integer          not null
#  issue_id        :integer          not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  note            :text
#  url             :string
#  completion_date :datetime
#  status          :string           default("stopped"), not null
#
# Indexes
#
#  index_solutions_on_issue_id                (issue_id)
#  index_solutions_on_person_id               (person_id)
#  index_solutions_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :solution do
    association :person, factory: :person
    association :issue, factory: :issue
  end
end
