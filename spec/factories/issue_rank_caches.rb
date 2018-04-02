# == Schema Information
#
# Table name: issue_rank_caches
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  issue_id   :integer          not null
#  rank       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_issue_rank_caches_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :issue_rank_cache, :class => IssueRankCache do
    association :issue, factory: :issue
    association :person, factory: :person
    rank 1
  end
end
