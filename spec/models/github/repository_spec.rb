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

require 'spec_helper'
require 'support/mock_github_api'

describe Github::Repository do
  describe "account" do
    let!(:repository) { create(:tracker) }
    let!(:backer)     { create(:person_with_money_in_account, money_amount: 100) }

    it "should not have account after create" do
      repository.account.should be_nil
    end

    it "should not lazy load account" do
      lambda {
        repository.account
      }.should_not change(Account, :count)
    end

    it "should create account on transaction" do
      repository.account.should be_nil

      lambda {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: -10,  account: Account::Paypal.instance },
            { amount: 10,   item: repository }
          ])
        end
      }.should change(repository.transactions, :count).by 1

      repository.reload.account.should be_an Account::Repository
    end

    describe "with account" do
      let!(:transaction) do
        Transaction.build do |tr|
          tr.splits.create([
            { amount: -10,  account: Account::Paypal.instance },
            { amount: 10,   item: repository }
          ])
        end
      end

      it "should establish relationship to account" do
        repository.reload.account.should be_an Account::Repository
      end
    end
  end

  describe "Search" do
    let!(:tracker) { create(:github_repository, url: "https://github.com/corytheboyd/shibe.js") }

    it "should find issue by URL" do
      Github::Repository.extract_from_url(nil).should_not be_present
      Github::Repository.extract_from_url("").should_not be_present
      Github::Repository.extract_from_url(tracker.url).should be_present
      Github::Repository.extract_from_url("https://github.com/corytheboyd/shibe.js/").should be_present
      Github::Repository.extract_from_url("https://github.com/corytheboyd/shibe.js/wiki").should be_present
      Github::Repository.extract_from_url("https://github.com/corytheboyd/shibe.js/issues").should be_present
      Github::Repository.extract_from_url("https://github.com/corytheboyd/shibe.js/issues/1").should be_present
      Github::Repository.extract_from_url("https://github.com/corytheboyd/shibe.js/pulls/1").should be_present
      Github::Repository.extract_from_url("https://github.com/corytheboyd/shibe.js/issues/1/").should be_present
      Github::Repository.extract_from_url("https://www.other-tracker.com/1337").should be_nil
    end
  end

  describe "update languages" do
    let(:tracker) { create(:github_repository) }

    before do
      tracker.stub(:fetch_languages) do
        {
          "JavaScript" => 1337,
          "Ruby" => 42
        }
      end
    end

    it "should fetch languages" do
      tracker.should_receive(:fetch_languages).once
      tracker.update_languages
    end

    it "should create new languages" do
      expect {
        tracker.update_languages
      }.to change(Language, :count).by 2
    end

    it "should create new relations" do
      expect {
        tracker.update_languages
      }.to change(tracker.language_relations, :count).by 2
    end

    it "should remove relation" do
      language = create(:language, name: "Shibe")
      tracker.language_relations.create(language: language, bytes: ("wow-such-bytes".length * 1337) / 42)

      tracker.languages.should include language
      tracker.update_languages
      tracker.reload.languages.should_not include language
    end
  end

  describe '::update_attributes_from_github_data' do
    # Data from: /repos/bountysource/frontend
    let (:github_data) { JSON.parse %({ "id": 5534023, "name": "frontend", "full_name": "bountysource/frontend", "owner": { "login": "bountysource", "id": 924798, "avatar_url": "https://avatars.githubusercontent.com/u/924798?", "gravatar_id": "be17917983af5418067b533643341954", "url": "https://api.github.com/users/bountysource", "html_url": "https://github.com/bountysource", "followers_url": "https://api.github.com/users/bountysource/followers", "following_url": "https://api.github.com/users/bountysource/following{/other_user}", "gists_url": "https://api.github.com/users/bountysource/gists{/gist_id}", "starred_url": "https://api.github.com/users/bountysource/starred{/owner}{/repo}", "subscriptions_url": "https://api.github.com/users/bountysource/subscriptions", "organizations_url": "https://api.github.com/users/bountysource/orgs", "repos_url": "https://api.github.com/users/bountysource/repos", "events_url": "https://api.github.com/users/bountysource/events{/privacy}", "received_events_url": "https://api.github.com/users/bountysource/received_events", "type": "Organization", "site_admin": false }, "private": false, "html_url": "https://github.com/bountysource/frontend", "description": "Bountysource is the funding platform for open-source software.", "fork": false, "url": "https://api.github.com/repos/bountysource/frontend", "forks_url": "https://api.github.com/repos/bountysource/frontend/forks", "keys_url": "https://api.github.com/repos/bountysource/frontend/keys{/key_id}", "collaborators_url": "https://api.github.com/repos/bountysource/frontend/collaborators{/collaborator}", "teams_url": "https://api.github.com/repos/bountysource/frontend/teams", "hooks_url": "https://api.github.com/repos/bountysource/frontend/hooks", "issue_events_url": "https://api.github.com/repos/bountysource/frontend/issues/events{/number}", "events_url": "https://api.github.com/repos/bountysource/frontend/events", "assignees_url": "https://api.github.com/repos/bountysource/frontend/assignees{/user}", "branches_url": "https://api.github.com/repos/bountysource/frontend/branches{/branch}", "tags_url": "https://api.github.com/repos/bountysource/frontend/tags", "blobs_url": "https://api.github.com/repos/bountysource/frontend/git/blobs{/sha}", "git_tags_url": "https://api.github.com/repos/bountysource/frontend/git/tags{/sha}", "git_refs_url": "https://api.github.com/repos/bountysource/frontend/git/refs{/sha}", "trees_url": "https://api.github.com/repos/bountysource/frontend/git/trees{/sha}", "statuses_url": "https://api.github.com/repos/bountysource/frontend/statuses/{sha}", "languages_url": "https://api.github.com/repos/bountysource/frontend/languages", "stargazers_url": "https://api.github.com/repos/bountysource/frontend/stargazers", "contributors_url": "https://api.github.com/repos/bountysource/frontend/contributors", "subscribers_url": "https://api.github.com/repos/bountysource/frontend/subscribers", "subscription_url": "https://api.github.com/repos/bountysource/frontend/subscription", "commits_url": "https://api.github.com/repos/bountysource/frontend/commits{/sha}", "git_commits_url": "https://api.github.com/repos/bountysource/frontend/git/commits{/sha}", "comments_url": "https://api.github.com/repos/bountysource/frontend/comments{/number}", "issue_comment_url": "https://api.github.com/repos/bountysource/frontend/issues/comments/{number}", "contents_url": "https://api.github.com/repos/bountysource/frontend/contents/{+path}", "compare_url": "https://api.github.com/repos/bountysource/frontend/compare/{base}...{head}", "merges_url": "https://api.github.com/repos/bountysource/frontend/merges", "archive_url": "https://api.github.com/repos/bountysource/frontend/{archive_format}{/ref}", "downloads_url": "https://api.github.com/repos/bountysource/frontend/downloads", "issues_url": "https://api.github.com/repos/bountysource/frontend/issues{/number}", "pulls_url": "https://api.github.com/repos/bountysource/frontend/pulls{/number}", "milestones_url": "https://api.github.com/repos/bountysource/frontend/milestones{/number}", "notifications_url": "https://api.github.com/repos/bountysource/frontend/notifications{?since,all,participating}", "labels_url": "https://api.github.com/repos/bountysource/frontend/labels{/name}", "releases_url": "https://api.github.com/repos/bountysource/frontend/releases{/id}", "created_at": "2012-08-23T23:58:35Z", "updated_at": "2014-03-25T22:49:47Z", "pushed_at": "2014-03-25T22:49:47Z", "git_url": "git://github.com/bountysource/frontend.git", "ssh_url": "git@github.com:bountysource/frontend.git", "clone_url": "https://github.com/bountysource/frontend.git", "svn_url": "https://github.com/bountysource/frontend", "homepage": "https://www.bountysource.com/", "size": 65635, "stargazers_count": 129, "watchers_count": 129, "language": "JavaScript", "has_issues": true, "has_downloads": true, "has_wiki": true, "forks_count": 91, "mirror_url": null, "open_issues_count": 132, "forks": 91, "open_issues": 132, "watchers": 129, "default_branch": "master", "master_branch": "master", "permissions": { "admin": true, "push": true, "pull": true }, "organization": { "login": "bountysource", "id": 924798, "avatar_url": "https://avatars.githubusercontent.com/u/924798?", "gravatar_id": "be17917983af5418067b533643341954", "url": "https://api.github.com/users/bountysource", "html_url": "https://github.com/bountysource", "followers_url": "https://api.github.com/users/bountysource/followers", "following_url": "https://api.github.com/users/bountysource/following{/other_user}", "gists_url": "https://api.github.com/users/bountysource/gists{/gist_id}", "starred_url": "https://api.github.com/users/bountysource/starred{/owner}{/repo}", "subscriptions_url": "https://api.github.com/users/bountysource/subscriptions", "organizations_url": "https://api.github.com/users/bountysource/orgs", "repos_url": "https://api.github.com/users/bountysource/repos", "events_url": "https://api.github.com/users/bountysource/events{/privacy}", "received_events_url": "https://api.github.com/users/bountysource/received_events", "type": "Organization", "site_admin": false }, "network_count": 91, "subscribers_count": 24 }) }

    let!(:repository) { create(:github_repository, remote_id: github_data['id']) }

    let(:action) do
      lambda { |data,options={}|
        Github::Repository.send(:update_attributes_from_github_data, data, options)
      }
    end

    it 'should raise error when missing id in github data' do
      github_data.delete('id')
      expect { action[github_data] }.to raise_error Github::Repository::Error
    end

    it 'should raise error when missing url in github data' do
      github_data.delete('html_url')
      github_data.delete('url')
      expect { action[github_data] }.to raise_error Github::Repository::Error
    end

    it 'should get URL from github data' do
      url = Github::Repository.send(:get_url_from_github_data, github_data)
      url.should be == github_data['html_url']
    end

    it 'should create cloudinary id from github data' do
      cloudinary_id = Github::Repository.send(:get_cloudinary_id_from_github_data, github_data)
      cloudinary_id == "gravatar:#{github_data['owner']['gravatar_id']}"
    end

    it 'should create new Tracker model if not found by remote_id' do
      repository.update_attribute(:remote_id, 1337)
      expect { action[github_data] }.to change(Github::Repository, :count).by 1
    end

    it 'should not create new tracker when found by remote_id' do
      expect { action[github_data] }.not_to change(Github::Repository, :count)
    end

    it 'should update existing Tracker when already loaded' do
      expect {
        action[github_data]
        repository.reload
      }.to change(repository, :description).to(github_data['description'])
    end

    it 'should update attributes from github data' do
      action[github_data]
      repository.reload.url.should    be == Github::Repository.send(:get_url_from_github_data, github_data)
      repository.full_name.should     be == github_data['full_name']
      repository.is_fork.should       be == github_data['fork']
      repository.pushed_at.should     be == github_data['pushed_at']
      repository.watchers.should      be == github_data['watchers_count']
      repository.forks.should         be == github_data['forks']
      repository.has_issues.should    be == github_data['has_issues']
      repository.has_wiki.should      be == github_data['has_wiki']
      repository.has_downloads.should be == github_data['has_downloads']
      repository.private.should       be == github_data['private']
    end

    it 'should create linked account for tracker owner' do
      expect { action[github_data] }.to change(LinkedAccount::Github::Organization, :count).by 1
    end

    describe 'versioned attributes' do

      it 'should update remote_* attributes' do
        action[github_data]
        repository.reload.remote_name.should be == github_data['full_name']
        repository.remote_description.should be == github_data['description']
        repository.remote_homepage.should be == github_data['homepage']
        repository.remote_cloudinary_id.should be == Github::Repository.send(:get_cloudinary_id_from_github_data, github_data)
      end

      it 'should update visible attributes when nil' do
        repository.update_attributes!(
          description: '',
          homepage: '',
          cloudinary_id: ''
        )

        action[github_data]

        repository.reload.description.should be == github_data['description']
        repository.homepage.should be == github_data['homepage']
        repository.cloudinary_id.should be == Github::Repository.send(:get_cloudinary_id_from_github_data, github_data)
      end

      it 'should not update visible attributes when they are set' do
        repository.update_attributes!(
          description: 'description!',
          homepage: 'homepage!',
          cloudinary_id: 'cloudinary id!'
        )

        action[github_data]

        repository.reload.description.should be == 'description!'
        repository.homepage.should be == 'homepage!'
        repository.cloudinary_id.should be == 'cloudinary id!'
      end

    end
  end

  describe '::extract_from_url' do

    let!(:repository) { create(:github_repository, url: 'https://github.com/bountysource/frontend') }
    let(:action) { lambda { |url| Github::Repository.extract_from_url url } }

    it 'should return nil if URL blank' do
      fetched_repository = action[nil]
      fetched_repository.should be_nil
    end

    it 'should return nil if URL invalid' do
      fetched_repository = action['https://www.disney.com']
      fetched_repository.should be_nil
    end

    it 'should return Repository if URL valid and in database' do
      fetched_repository = action[repository.url]
      fetched_repository.id.should be == repository.id
    end

    describe 'not in database' do

      it 'should fetch from GitHub if URL valid and not in database' do
        Github::API.stub(:call) { MockGithubApi::Success.new }
        Github::Repository.should_receive(:update_attributes_from_github_data).once
        action['https://github.com/neovim/neovim']
      end

      it 'should do nothing if API response fails' do
        Github::API.stub(:call) { MockGithubApi::Error.new }
        Github::Repository.should_receive(:update_attributes_from_github_data).never
        fetched_repository = action['https://github.com/neovim/neovim']
        fetched_repository.should be_nil
      end

    end

  end

end
