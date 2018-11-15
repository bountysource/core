# == Schema Information
#
# Table name: accounts
#
#  id                      :integer          not null, primary key
#  type                    :string(255)      default("Account"), not null
#  description             :string(255)      default(""), not null
#  currency                :string(255)      default("USD"), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  owner_id                :integer
#  owner_type              :string(255)
#  standalone              :boolean          default(FALSE)
#  override_fee_percentage :integer
#
# Indexes
#
#  index_accounts_on_item_id    (owner_id)
#  index_accounts_on_item_type  (owner_type)
#  index_accounts_on_type       (type)
#

FactoryBot.define do
  factory :account do
    factory :fundraiser_account, class: Account::Fundraiser do
      association :owner, factory: :fundraiser
    end

    factory :issue_account, class: Account::IssueAccount do
      association :owner, factory: :issue
    end

    factory :repo_account, class: Account::Repository do
      association :owner, factory: :tracker
    end

    factory :team_account, class: Account::Team do
      owner { |a| a.association(:team) }
    end
  end
end
