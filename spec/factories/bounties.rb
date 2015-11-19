# == Schema Information
#
# Table name: bounties
#
#  id                :integer          not null, primary key
#  amount            :decimal(10, 2)   not null
#  person_id         :integer
#  issue_id          :integer          not null
#  status            :string(12)       default("active"), not null
#  expires_at        :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  paid_at           :datetime
#  anonymous         :boolean          default(FALSE), not null
#  owner_type        :string(255)
#  owner_id          :integer
#  bounty_expiration :string(255)
#  upon_expiration   :string(255)
#  promotion         :string(255)
#  acknowledged_at   :datetime
#  tweet             :boolean          default(FALSE), not null
#  featured          :boolean          default(FALSE), not null
#
# Indexes
#
#  index_bounties_on_anonymous        (anonymous)
#  index_bounties_on_github_issue_id  (issue_id)
#  index_bounties_on_owner_id         (owner_id)
#  index_bounties_on_owner_type       (owner_type)
#  index_bounties_on_patron_id        (person_id)
#  index_bounties_on_status           (status)
#

FactoryGirl.define do
  factory :bounty, class: Bounty do
    association :person, factory: :person
    association :issue, factory: :issue
    amount 100

    after(:create) do |bounty|
      bounty.issue.update_bounty_total
    end

  end
end
