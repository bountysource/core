FactoryBot.define do

  factory :issue, class: Issue do
    association     :tracker, factory: :tracker

    can_add_bounty  true
    title "Massive bug in derp-herpulator.rb"
    body "Lorizzle ipsum dolor mofo amizzle, izzle adipiscing sure. Ha! ha! Lorem ipsum!"

    sequence(:url) { |n| "https://www.randomsite.local/issues/#{n}" }

    factory :github_issue, class: Github::Issue do
      association :author, factory: :linked_account_github
      association :tracker, factory: :github_repository

      sequence(:remote_id) { |n| n }
      sequence(:number) { |n| n }
      sequence(:url)    { |n| "https://github.com/testuser/repository/issues/#{n}" }
    end

    trait :closed do
      can_add_bounty false
    end

    factory :closed_issue, class: Issue do
      can_add_bounty false
    end

    factory :jira_issue, class: Jira::Issue do
      association :tracker, factory: :jira_tracker
    end

    factory :bugzilla_issue, class: Bugzilla::Issue do
      association :tracker, factory: :bugzilla_tracker
    end

    factory :redmine_issue, class: Redmine::Issue do
      association :tracker, factory: :redmine_tracker
    end

    factory :gitlab, class: Gitlab::Issue do
      association :tracker, factory: :gitlab_tracker
    end

    factory :sourceforge_issue, class: SourceForge::Issue do
      association :tracker, factory: :sourceforge_tracker
    end

    factory :sourceforge_native_issue, class: SourceForgeNative::Issue do
      association :tracker, factory: :sourceforge_native_tracker
    end

    factory :googlecode_issue, class: GoogleCode::Issue do
      association :tracker, factory: :googlecode_tracker
    end

    factory :launchpad_issue, class: Launchpad::Issue do
      association :tracker, factory: :launchpad_tracker
    end

    factory :bitbucket_issue, class: Bitbucket::Issue do
      sequence(:url) { |n| "https://bitbucket.org/username/repo#{n}/issues/#{n}" }
      association :tracker, factory: :bitbucket_tracker
    end

    factory :pivotal_issue, class: Pivotal::Issue do
      sequence(:url) { |n| "https://www.pivotaltracker.com/story/show/#{n}" }
      association :tracker, factory: :pivotal_tracker
    end

    factory :trac_issue, class: Trac::Issue do
      association :tracker, factory: :trac_tracker

      #sequence(:number) {|n| n }
      #state { 'open' }
      #body { 'body' }
      #priority { 'high' }
    end
  end
end