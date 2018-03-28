# == Schema Information
#
# Table name: linked_accounts
#
#  id               :integer          not null, primary key
#  person_id        :integer
#  type             :string(255)
#  uid              :integer          not null
#  login            :string(255)
#  first_name       :string(255)
#  last_name        :string(255)
#  email            :string(255)
#  oauth_token      :string(255)
#  oauth_secret     :string(255)
#  permissions      :string(255)
#  synced_at        :datetime
#  sync_in_progress :boolean          default(FALSE)
#  followers        :integer          default(0)
#  following        :integer          default(0)
#  created_at       :datetime
#  updated_at       :datetime
#  account_balance  :decimal(10, 2)   default(0.0)
#  anonymous        :boolean          default(FALSE), not null
#  company          :string(255)
#  location         :string(255)
#  bio              :text
#  cloudinary_id    :string(255)
#  deleted_at       :datetime
#
# Indexes
#
#  index_linked_accounts_on_anonymous     (anonymous)
#  index_linked_accounts_on_email         (email)
#  index_linked_accounts_on_login         (login)
#  index_linked_accounts_on_person_id     (person_id)
#  index_linked_accounts_on_uid           (uid)
#  index_linked_accounts_on_uid_and_type  (uid,type) UNIQUE
#

require 'spec_helper'

describe LinkedAccount::Github::User do

  # TODO: update this old code to test the new LinkedAccount::Github::User.sync_all_data
  #describe "find projects" do
  #  let(:person)          { create(:person) }
  #  let(:linked_account)  { create(:github_account, person: person, oauth_token: 'abc123') }
  #
  #  let!(:repo_owner_of)        { create(:github_repository) }
  #  let!(:repo_member_of)       { create(:github_repository) }
  #  let!(:repo_in_organization) { create(:github_repository) }
  #  let!(:repo_unrelated)       { create(:github_repository) }
  #
  #  before do
  #    linked_account.stub(:find_or_create_repositories_owned).and_return([repo_owner_of])
  #    linked_account.stub(:find_order_create_repositories_collaborating_on).and_return([repo_member_of])
  #    linked_account.stub(:find_or_create_repositories_from_organizations).and_return([repo_in_organization])
  #
  #    linked_account.sync_all_data
  #  end
  #
  #  context "repo find" do
  #    it "should find repo by remote_id" do
  #      repo = create(:github_repository, remote_id: 1337)
  #      repo.should == Github::Repository.update_attributes_from_github_data('id' => 1337, 'url' => 'https://github.com/bountysource/frontend')
  #    end
  #
  #    it "should create repo if not found" do
  #      lambda {
  #        Github::Repository.update_attributes_from_github_data({
  #          'id' => 123456789,
  #          'url' =>       'https://github.com/bountysource/frontend',
  #          'name' =>      'Test',
  #          'full_name' => 'test/test'
  #        })
  #      }.should change(Github::Repository, :count).by 1
  #    end
  #  end
  #
  #  it "should esteblish owner relationship" do
  #    person.projects.should include repo_owner_of
  #    TrackerRelation::Owner.where(tracker_id: repo_owner_of.id, linked_account_id: linked_account.id).should_not be_empty
  #  end
  #
  #  it "should establish committer relationship" do
  #    person.projects.should include repo_member_of
  #    TrackerRelation::Committer.where(tracker_id: repo_member_of.id, linked_account_id: linked_account.id).should_not be_empty
  #  end
  #
  #  it "should not establish relation with random repo" do
  #    person.projects.should_not include repo_unrelated
  #    TrackerRelation::Owner.where(tracker_id: repo_unrelated.id, linked_account_id: linked_account.id).should be_empty
  #    TrackerRelation::Committer.where(tracker_id: repo_unrelated.id, linked_account_id: linked_account.id).should be_empty
  #  end
  #
  #  it "should establish relation with repo in organization" do
  #    person.projects.should include repo_in_organization
  #    TrackerRelation::OrganizationMember.where(tracker_id: repo_in_organization.id, linked_account_id: linked_account.id).should_not be_empty
  #  end
  #end

  describe '::update_attributes_from_github_data' do

    let(:github_data) { JSON.parse %({ "login": "corytheboyd", "id": 692632, "avatar_url": "https://avatars.githubusercontent.com/u/692632?", "gravatar_id": "bdeaea505d059ccf23d8de5714ae7f73", "url": "https://api.github.com/users/corytheboyd", "html_url": "https://github.com/corytheboyd", "followers_url": "https://api.github.com/users/corytheboyd/followers", "following_url": "https://api.github.com/users/corytheboyd/following{/other_user}", "gists_url": "https://api.github.com/users/corytheboyd/gists{/gist_id}", "starred_url": "https://api.github.com/users/corytheboyd/starred{/owner}{/repo}", "subscriptions_url": "https://api.github.com/users/corytheboyd/subscriptions", "organizations_url": "https://api.github.com/users/corytheboyd/orgs", "repos_url": "https://api.github.com/users/corytheboyd/repos", "events_url": "https://api.github.com/users/corytheboyd/events{/privacy}", "received_events_url": "https://api.github.com/users/corytheboyd/received_events", "type": "User", "site_admin": false, "name": "Cory Boyd", "company": "Bountysource", "blog": "", "location": "San Francisco, CA", "email": "cory@bountysource.com", "hireable": false, "bio": null, "public_repos": 17, "public_gists": 4, "followers": 11, "following": 4, "created_at": "2011-03-26T22:30:29Z", "updated_at": "2014-03-25T20:15:24Z" }) }

    let!(:linked_account) { create(:github_account, uid: github_data['id']) }

    let(:action) do
      lambda { |data,options={}|
        LinkedAccount::Github.update_attributes_from_github_data data, options
      }
    end

    it 'should create new LinkedAccount if not found by uid' do
      linked_account.update_attribute(:uid, 1337)
      expect { action[github_data] }.to change(LinkedAccount::Github::User, :count).by 1
    end

    it 'should not create new LinkedAccount when found' do
      expect { action[github_data] }.not_to change(LinkedAccount::Github::User, :count)
    end

    describe 'User' do

      it 'should get cloudinary_id from github data' do
        cloudinary_id = LinkedAccount::Github.send(:get_cloudinary_id_from_github_data, github_data)
        expect(cloudinary_id).to eq("gravatar:#{github_data['gravatar_id']}")
      end

      it 'should update attributes' do
        linked_account = action[github_data]
        expect(linked_account.reload).to be_a LinkedAccount::Github::User
        expect(linked_account.uid).to eq(github_data['id'])
        expect(linked_account.login).to eq(github_data['login'])
        expect(linked_account.email).to eq(github_data['email'])
        expect(linked_account.first_name).to eq(github_data['name'])
        expect(linked_account.company).to eq(github_data['company'])
        expect(linked_account.location).to eq(github_data['location'])
        expect(linked_account.bio).to eq(github_data['bio'])
        expect(linked_account.followers).to eq(github_data['followers'])
        expect(linked_account.following).to eq(github_data['following'])
      end

    end

    describe 'Organization' do

      let(:github_data) { JSON.parse %({ "login": "bountysource", "id": 924798, "avatar_url": "https://avatars.githubusercontent.com/u/924798?", "gravatar_id": "be17917983af5418067b533643341954", "url": "https://api.github.com/users/bountysource", "html_url": "https://github.com/bountysource", "followers_url": "https://api.github.com/users/bountysource/followers", "following_url": "https://api.github.com/users/bountysource/following{/other_user}", "gists_url": "https://api.github.com/users/bountysource/gists{/gist_id}", "starred_url": "https://api.github.com/users/bountysource/starred{/owner}{/repo}", "subscriptions_url": "https://api.github.com/users/bountysource/subscriptions", "organizations_url": "https://api.github.com/users/bountysource/orgs", "repos_url": "https://api.github.com/users/bountysource/repos", "events_url": "https://api.github.com/users/bountysource/events{/privacy}", "received_events_url": "https://api.github.com/users/bountysource/received_events", "type": "Organization", "site_admin": false, "name": "Bountysource", "company": null, "blog": "https://www.bountysource.com/", "location": "San Francisco, CA", "email": "support@bountysource.com", "hireable": false, "bio": null, "public_repos": 6, "public_gists": 0, "followers": 0, "following": 0, "created_at": "2011-07-19T08:10:34Z", "updated_at": "2014-03-27T02:49:51Z" }) }

      let!(:linked_account) { create(:github_account, uid: github_data['id']) }

      it 'should get cloudinary_id from github data' do
        cloudinary_id = LinkedAccount::Github.send(:get_cloudinary_id_from_github_data, github_data)
        expect(cloudinary_id).to eq("gravatar:#{github_data['gravatar_id']}")
      end

      it 'should update attributes' do
        linked_account = action[github_data]
        expect(linked_account).to be_a LinkedAccount::Github::Organization
        expect(linked_account.uid).to eq(github_data['id'])
        expect(linked_account.login).to eq(github_data['login'])
        expect(linked_account.email).to eq(github_data['email'])
        expect(linked_account.first_name).to eq(github_data['name'])
        expect(linked_account.company).to eq(github_data['company'])
        expect(linked_account.location).to eq(github_data['location'])
        expect(linked_account.bio).to eq(github_data['bio'])
        expect(linked_account.followers).to eq(github_data['followers'])
        expect(linked_account.following).to eq(github_data['following'])
      end

    end
  end
end
