# == Schema Information
#
# Table name: trackers
#
#  id                   :integer          not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  remote_id            :integer
#  url                  :string(255)      not null
#  name                 :string(255)      not null
#  full_name            :string(255)
#  is_fork              :boolean          default(FALSE)
#  watchers             :integer          default(0), not null
#  forks                :integer          default(0)
#  pushed_at            :datetime
#  description          :text
#  featured             :boolean          default(FALSE), not null
#  open_issues          :integer          default(0), not null
#  synced_at            :datetime
#  project_tax          :decimal(9, 4)    default(0.0)
#  has_issues           :boolean          default(TRUE), not null
#  has_wiki             :boolean          default(FALSE), not null
#  has_downloads        :boolean          default(FALSE), not null
#  private              :boolean          default(FALSE), not null
#  homepage             :string(255)
#  sync_in_progress     :boolean          default(FALSE), not null
#  bounty_total         :decimal(10, 2)   default(0.0), not null
#  account_balance      :decimal(10, 2)   default(0.0)
#  type                 :string(255)      default("Tracker"), not null
#  cloudinary_id        :string(255)
#  closed_issues        :integer          default(0), not null
#  delta                :boolean          default(TRUE), not null
#  can_edit             :boolean          default(TRUE), not null
#  repo_url             :text
#  rank                 :integer          default(0), not null
#  remote_cloudinary_id :string(255)
#  remote_name          :string(255)
#  remote_description   :text
#  remote_homepage      :string(255)
#  remote_language_ids  :integer          default([]), is an Array
#  language_ids         :integer          default([]), is an Array
#  team_id              :integer
#  deleted_at           :datetime
#  issues_count         :integer          default(0)
#
# Indexes
#
#  index_trackers_on_bounty_total   (bounty_total)
#  index_trackers_on_closed_issues  (closed_issues)
#  index_trackers_on_delta          (delta)
#  index_trackers_on_open_issues    (open_issues)
#  index_trackers_on_rank           (rank)
#  index_trackers_on_remote_id      (remote_id)
#  index_trackers_on_team_id        (team_id)
#  index_trackers_on_type           (type)
#  index_trackers_on_url            (url) UNIQUE
#  index_trackers_on_watchers       (watchers)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do

  factory :tracker, class: Tracker do
    featured        false
    sequence(:name) { |n| "Generic repo #{n}" }
    sequence(:url)  { |n| "https://www.randomsite-#{n}.local/" }
    sequence(:full_name) { |n| "bountysource/test-repo#{n}" }
    homepage        "http://www.google.com"
    project_tax     0

    factory :trac_tracker, class: Trac::Tracker do
      sequence(:name) { |n| "Trac repo #{n}" }
    end

    factory :jira_tracker, class: Jira::Tracker do
      sequence(:name) { |n| "Jira repo #{n}" }
      sequence(:url) { |n| "https://www.randomsite-#{n}.local/browse/PROJECT" }
    end

    factory :bugzilla_tracker, class: Bugzilla::Tracker do
      sequence(:name) { |n| "Bugzilla repo #{n}" }
      sequence(:url) { |n| "https://www.randomsite-#{n}.local/bugs/buglist.cgi?product=abc" }
    end

    factory :sourceforge_tracker, class: SourceForge::Tracker do
      sequence(:name) { |n| "SourceForge#{n}" }
      sequence(:url) { |n| "http://sourceforge.net/projects/sourceforge#{n}/" }
    end

    factory :sourceforge_native_tracker, class: SourceForgeNative::Tracker do
      sequence(:name) { |n| "SourceForgeNative#{n}" }
      sequence(:url) { |n| "http://sourceforge.net/tracker/?group_id=#{n}&atid=1" }
    end

    factory :googlecode_tracker, class: GoogleCode::Tracker do
      sequence(:name) { |n| "GoogleCode#{n}" }
      sequence(:url) { |n| "https://code.google.com/p/project#{n}/" }
    end

    factory :launchpad_tracker, class: Launchpad::Tracker do
      sequence(:name) { |n| "Launchpad#{n}" }
      sequence(:url) { |n| "https://bugs.launchpad.net/launchpad#{n}" }
    end

    factory :bitbucket_tracker, class: Bitbucket::Tracker do
      sequence(:name) { |n| "username/repo#{n}" }
      sequence(:url) { |n| "https://bitbucket.org/username/repo#{n}" }
    end

    factory :pivotal_tracker, class: Pivotal::Tracker do
      sequence(:name) { |n| "Project#{n}" }
      sequence(:url) { |n| "https://www.pivotaltracker.com/projects/#{n}" }
    end

    factory :github_repository, class: Github::Repository do
      sequence(:remote_id) { |n| n }
      sequence(:name) { |n| "Github project-#{n}" }
      sequence(:url)  { |n| "https://github.com/testuser/repository#{n}" }
      is_fork         { false }
      watchers        { rand(10000) }
      forks           { rand(10000) }

      factory :github_repository_with_issues do
        synced_at { nil }
        after(:create) {|repo| create_list(:github_issue, 10, tracker: repo, synced_at: nil) }
      end
    end
  end
end
