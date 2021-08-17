# == Schema Information
#
# Table name: fundraisers
#
#  id                :integer          not null, primary key
#  person_id         :integer          not null
#  published         :boolean          default(FALSE), not null
#  title             :string
#  homepage_url      :string
#  repo_url          :string
#  description       :text
#  about_me          :text
#  funding_goal      :bigint(8)        default(100)
#  published_at      :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  total_pledged     :decimal(10, 2)   default(0.0), not null
#  featured          :boolean          default(FALSE), not null
#  short_description :string
#  days_open         :integer          default(30)
#  ends_at           :datetime
#  breached_at       :datetime
#  completed         :boolean          default(FALSE), not null
#  breached          :boolean          default(FALSE), not null
#  featured_at       :boolean
#  hidden            :boolean          default(FALSE), not null
#  cloudinary_id     :string
#  team_id           :integer
#  tracker_id        :integer
#
# Indexes
#
#  index_fundraisers_on_breached     (breached)
#  index_fundraisers_on_completed    (completed)
#  index_fundraisers_on_ends_at      (ends_at)
#  index_fundraisers_on_featured     (featured)
#  index_fundraisers_on_featured_at  (featured_at)
#  index_fundraisers_on_hidden       (hidden)
#  index_fundraisers_on_person_id    (person_id)
#  index_fundraisers_on_published    (published)
#

FactoryBot.define do
  factory :fundraiser, class: 'Fundraiser' do
    association :person, factory: :person
    association :team, factory: :team
    title { "Lorem ipsum dolor sit amet, consectetur adipisicing elit." }
    description { "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }
    about_me  { "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." }
    short_description "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et"
    days_open Fundraiser.min_days_open
    funding_goal { 2000 }

    factory :published_fundraiser, class: 'Fundraiser' do
      after(:create) { |fundraiser| fundraiser.publish! }
    end
  end
end
