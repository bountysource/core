# == Schema Information
#
# Table name: issues
#
#  id                       :integer          not null, primary key
#  github_pull_request_id   :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  number                   :integer
#  url                      :string           not null
#  title                    :text
#  labels                   :string
#  code                     :boolean          default(FALSE)
#  state                    :string
#  body                     :text
#  remote_updated_at        :datetime
#  remote_id                :integer
#  tracker_id               :integer
#  solution_id              :integer
#  featured                 :boolean          default(FALSE), not null
#  remote_created_at        :datetime
#  synced_at                :datetime
#  comment_count            :integer          default(0)
#  sync_in_progress         :boolean          default(FALSE), not null
#  bounty_total             :decimal(10, 2)   default(0.0), not null
#  type                     :string           default("Issue"), not null
#  remote_type              :string
#  priority                 :string
#  milestone                :string
#  can_add_bounty           :boolean          default(FALSE), not null
#  accepted_bounty_claim_id :integer
#  author_name              :string
#  owner                    :string
#  paid_out                 :boolean          default(FALSE), not null
#  participants_count       :integer
#  thumbs_up_count          :integer
#  votes_count              :integer
#  watchers_count           :integer
#  severity                 :string
#  delta                    :boolean          default(TRUE), not null
#  author_linked_account_id :integer
#  solution_started         :boolean          default(FALSE), not null
#  body_markdown            :text
#  deleted_at               :datetime
#  category                 :integer
#
# Indexes
#
#  index_issues_on_comment_count                  (comment_count)
#  index_issues_on_delta                          (delta)
#  index_issues_on_featured                       (featured)
#  index_issues_on_remote_id                      (remote_id)
#  index_issues_on_solution_started               (solution_started)
#  index_issues_on_tracker_id_and_bounty_total    (tracker_id,bounty_total)
#  index_issues_on_type                           (type)
#  index_issues_on_url                            (url) UNIQUE
#  index_issues_on_votes_count                    (votes_count)
#  index_issues_on_watchers_count                 (watchers_count)
#  index_issues_partial_author_linked_account_id  (author_linked_account_id) WHERE (author_linked_account_id IS NOT NULL)
#  index_issues_partial_bounty_total              (bounty_total) WHERE (bounty_total > (0)::numeric)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count) WHERE (COALESCE(thumbs_up_count, 0) > 0)
#

require 'spec_helper'

describe Github::Issue do
  let(:person) { create(:person) }
  let(:backer) { create(:backer) }
  let(:backer1) { create(:person, email: 'awesome1@backer.com') }
  let(:backer2) { create(:person, email: 'awesome2@backer.com') }
  let(:tracker) { create(:github_repository) }
  let(:issue) { create(:github_issue, tracker: tracker) }

  it "should have a valid factory" do
    expect(issue).to be_valid
  end

  describe "extract_from_url" do
    let!(:issue) { create(:github_issue, url: "https://github.com/corytheboyd/shibe.js/issues/2", number: 2) }

    it "should find issue by URL" do
      expect(Github::Issue.extract_from_url(nil)).to be_nil
      expect(Github::Issue.extract_from_url("")).to be_nil
      expect(Github::Issue.extract_from_url(issue.url)).to eq(issue)
      expect(Github::Issue.extract_from_url("https://github.com/corytheboyd/shibe.js/issues/#{issue.number}")).to eq(issue)
      expect(Github::Issue.extract_from_url("https://github.com/corytheboyd/shibe.js/issues/#{issue.number}/")).to eq(issue)
      expect(Github::Issue.extract_from_url("https://github.com/corytheboyd/shibe.js/issues")).to be_nil
      expect(Github::Issue.extract_from_url("https://github.com/corytheboyd/shibe.js/wiki")).to be_nil
      expect(Github::Issue.extract_from_url("https://github.com/corytheboyd/shibe.js")).to be_nil
      expect(Github::Issue.extract_from_url("https://github.com/corytheboyd/shibe.js/")).to be_nil
      expect(Github::Issue.extract_from_url("https://www.other-tracker.com/issues/1337")).to be_nil
    end
  end

  describe '::update_attributes_from_github_data' do

    # Data from: /repos/bountysource/frontend
    let (:github_data) { JSON.parse %({ "url": "https://api.github.com/repos/bountysource/frontend/issues/493", "labels_url": "https://api.github.com/repos/bountysource/frontend/issues/493/labels{/name}", "comments_url": "https://api.github.com/repos/bountysource/frontend/issues/493/comments", "events_url": "https://api.github.com/repos/bountysource/frontend/issues/493/events", "html_url": "https://github.com/bountysource/frontend/issues/493", "id": 30169482, "number": 493, "title": "Sell merchandise for a team", "user": { "login": "rappo", "id": 2245234, "avatar_url": "https://avatars.githubusercontent.com/u/2245234?", "gravatar_id": "4e32fc6478f3dd6b42cef6e4b7c76979", "url": "https://api.github.com/users/rappo", "html_url": "https://github.com/rappo", "followers_url": "https://api.github.com/users/rappo/followers", "following_url": "https://api.github.com/users/rappo/following{/other_user}", "gists_url": "https://api.github.com/users/rappo/gists{/gist_id}", "starred_url": "https://api.github.com/users/rappo/starred{/owner}{/repo}", "subscriptions_url": "https://api.github.com/users/rappo/subscriptions", "organizations_url": "https://api.github.com/users/rappo/orgs", "repos_url": "https://api.github.com/users/rappo/repos", "events_url": "https://api.github.com/users/rappo/events{/privacy}", "received_events_url": "https://api.github.com/users/rappo/received_events", "type": "User", "site_admin": false }, "labels": [ { "url": "https://api.github.com/repos/bountysource/frontend/labels/teams", "name": "teams", "color": "0052cc" } ], "state": "open", "assignee": null, "milestone": { "url": "https://api.github.com/repos/bountysource/frontend/milestones/4", "labels_url": "https://api.github.com/repos/bountysource/frontend/milestones/4/labels", "id": 609826, "number": 4, "title": "More ways for teams to earn money", "description": "", "creator": { "login": "rappo", "id": 2245234, "avatar_url": "https://avatars.githubusercontent.com/u/2245234?", "gravatar_id": "4e32fc6478f3dd6b42cef6e4b7c76979", "url": "https://api.github.com/users/rappo", "html_url": "https://github.com/rappo", "followers_url": "https://api.github.com/users/rappo/followers", "following_url": "https://api.github.com/users/rappo/following{/other_user}", "gists_url": "https://api.github.com/users/rappo/gists{/gist_id}", "starred_url": "https://api.github.com/users/rappo/starred{/owner}{/repo}", "subscriptions_url": "https://api.github.com/users/rappo/subscriptions", "organizations_url": "https://api.github.com/users/rappo/orgs", "repos_url": "https://api.github.com/users/rappo/repos", "events_url": "https://api.github.com/users/rappo/events{/privacy}", "received_events_url": "https://api.github.com/users/rappo/received_events", "type": "User", "site_admin": false }, "open_issues": 3, "closed_issues": 0, "state": "open", "created_at": "2014-03-25T20:45:16Z", "updated_at": "2014-03-25T22:24:54Z", "due_on": null }, "comments": 0, "created_at": "2014-03-25T22:20:53Z", "updated_at": "2014-03-25T22:21:50Z", "closed_at": null, "pull_request": { "url": null, "html_url": null, "diff_url": null, "patch_url": null }, "body": "Hi", "closed_by": null }) }

    # NOTE: Need to set the URL on the Tracker instead of using the default value set by FactoryBot
    let(:repository) { create(:github_repository, url: "https://github.com/bountysource/frontend") }
    let!(:issue) { create(:github_issue, tracker: repository, remote_id: github_data['id']) }

    let(:action) do
      lambda { |data,options={}|
        Github::Issue.send(:update_attributes_from_github_data, data, options)
      }
    end

    it 'should raise error when missing id from github data' do
      github_data.delete('id')
      expect { action[github_data] }.to raise_error Github::Issue::Error
    end

    it 'should raise error when missing url from github data' do
      github_data.delete('html_url')
      expect { action[github_data] }.to raise_error Github::Issue::Error
    end

    it 'should get URL from github data' do
      url = Github::Issue.send(:get_url_from_github_data, github_data)
      expect(url).to eq(github_data['html_url'])
    end

    it 'should create Issue when not found by remote id' do
      issue.update_attribute(:remote_id, 1337)
      expect { action[github_data] }.to change(Github::Issue, :count).by 1
    end

    it 'should not create Issue when found' do
      expect { action[github_data] }.not_to change(Github::Issue, :count)
    end

    it 'should update can_add_bounty to true' do
      issue.update_attribute :can_add_bounty, false
      github_data['state'] = 'open'

      action[github_data]

      expect(issue.reload.can_add_bounty).to be_truthy
    end

    it 'should update can_add_bounty to false' do
      issue.update_attribute :can_add_bounty, true
      github_data['state'] = 'closed'

      action[github_data]

      expect(issue.reload.can_add_bounty).to be_falsey
    end

    it 'should update can_add_bounty to false if a Pull Request' do
      issue.update_attribute :can_add_bounty, true
      github_data['state'] = 'open'
      allow_any_instance_of(Github::Issue).to receive(:code) { true }

      action[github_data]

      expect(issue.reload.can_add_bounty).to be_falsey
    end

    describe 'create new tracker' do

      before { allow(Github::Repository).to receive(:extract_from_url) { create(:github_repository) } }

      it 'should create Tracker when creating Issue without Tracker' do
        issue.update_attribute(:remote_id, 1337)
        repository.delete
        expect { action[github_data] }.to change(Github::Repository, :count).by 1
      end

    end

    it 'should create owner linked account' do
      issue.update_attribute(:author, nil)
      expect { action[github_data] }.to change(LinkedAccount::Github::User, :count).by 1
    end

    it 'should strip [$X] from title for plugin' do
      github_data['title'] = 'fix things and stuffs [$1,234,567]'
      action[github_data]
      expect(issue.reload.sanitized_title).to eq('fix things and stuffs')
    end
  end

end
