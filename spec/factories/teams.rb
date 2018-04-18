# == Schema Information
#
# Table name: teams
#
#  id                               :integer          not null, primary key
#  name                             :string           not null
#  slug                             :string
#  url                              :string
#  created_at                       :datetime         not null
#  updated_at                       :datetime         not null
#  cloudinary_id                    :string
#  bio                              :text
#  featured                         :boolean          default(FALSE), not null
#  linked_account_id                :integer
#  accepts_public_payins            :boolean          default(FALSE), not null
#  rfp_enabled                      :boolean          default(FALSE), not null
#  activity_total                   :decimal(, )      default(0.0), not null
#  bounties_disabled                :boolean
#  support_level_sum                :decimal(10, 2)
#  support_level_count              :integer
#  homepage_markdown                :text
#  homepage_featured                :integer
#  accepts_issue_suggestions        :boolean          default(FALSE), not null
#  new_issue_suggestion_markdown    :text
#  bounty_search_markdown           :text
#  resources_markdown               :text
#  monthly_contributions_sum        :decimal(10, 2)
#  monthly_contributions_count      :integer
#  can_email_stargazers             :boolean          default(FALSE), not null
#  previous_month_contributions_sum :decimal(10, 2)
#
# Indexes
#
#  index_companies_on_slug           (slug) UNIQUE
#  index_teams_on_activity_total     (activity_total)
#  index_teams_on_homepage_featured  (homepage_featured)
#  index_teams_on_linked_account_id  (linked_account_id)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :team do
    sequence(:name) { |n| "Generic Team ##{n}" }
    sequence(:slug) { |n| "team-#{n}" }

    trait :accepts_public_payins do
      accepts_public_payins true
    end
  end
end
