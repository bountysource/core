# == Schema Information
#
# Table name: bounty_claims
#
#  id          :integer          not null, primary key
#  person_id   :integer          not null
#  issue_id    :integer          not null
#  number      :integer
#  code_url    :string(255)
#  description :text
#  collected   :boolean
#  disputed    :boolean          default(FALSE), not null
#  paid_out    :boolean          default(FALSE), not null
#  rejected    :boolean          default(FALSE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  amount      :decimal(, )      default(0.0), not null
#
# Indexes
#
#  index_bounty_claims_on_issue_id                (issue_id)
#  index_bounty_claims_on_person_id               (person_id)
#  index_bounty_claims_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :bounty_claim do
    association :issue, factory: :closed_issue
    association :person

    sequence(:code_url) { |n| "https://github.com/bountysource/frontend/pulls/#{n}" }
    description "Lorizzle ipsizzle sizzle sizzle amet, bow wow wow adipiscing elit. My shizz fo shizzle velit, away volutpizzle, suscipizzle quizzle, gravida vizzle, izzle. Pellentesque funky fresh tortizzle."
  end
end
