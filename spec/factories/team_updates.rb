# == Schema Information
#
# Table name: team_updates
#
#  id            :integer          not null, primary key
#  number        :integer
#  title         :string
#  body          :text
#  published     :boolean          default(FALSE), not null
#  published_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  team_id       :integer          not null
#  mailing_lists :json
#
# Indexes
#
#  index_team_updates_on_published           (published)
#  index_team_updates_on_team_id_and_number  (team_id,number) UNIQUE
#

FactoryBot.define do
  factory :team_update, class: TeamUpdate do
    association :team, factory: :team
    body "Howdy y'all! I just added a few new rewards.\nCome check them out, there are only 10 of each!"
    title "New rewards!"
    mailing_lists ['bountysource']
    sequence(:number)

    factory :published_team_update, class: TeamUpdate do
      after(:create) { |update| update.publish! }
    end
  end
end
