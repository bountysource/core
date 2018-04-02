# == Schema Information
#
# Table name: person_relations
#
#  id               :integer          not null, primary key
#  type             :string           not null
#  person_id        :integer          not null
#  target_person_id :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_person_relations_on_person_id         (person_id)
#  index_person_relations_on_target_person_id  (target_person_id)
#  index_person_relations_on_type_and_people   (type,person_id,target_person_id) UNIQUE
#

require 'spec_helper'

describe PersonRelation::Github do
  let!(:person) { create(:person) }
  let!(:target_person) { create(:person) }
  let(:person_relation_github) { create(:person_relation_github, person: person, target_person: target_person) }

  it "should link person to target person" do
    expect {
      r = PersonRelation::Github.create person: person, target_person: target_person
      expect(r.person).to eq(person)
      expect(r.target_person).to eq(target_person)
    }.to change(PersonRelation::Github, :count).by 1
  end

  it "should make target appear in person's friend list" do
    expect(person_relation_github.person.friends).to include target_person
  end

  it "should not make person appear in target person's friend list" do
    expect(person_relation_github.target_person.friends).not_to include person
  end

  describe "finding friends" do
    let(:person) { create(:person_with_github_account) }
    let(:target_person1) { create(:person_with_github_account) }
    let(:target_person2) { create(:person_with_github_account) }
    let(:target_person3) { create(:person) }

    before do
      # fake the API response from Github
      allow(person.github_account).to receive(:following_logins) do
        # turn the people's linked accounts into hashes resembling those returned from facebook API
        [target_person1, target_person2].map(&:github_account).map(&:login)
      end
    end

    it "should create the correct friend relations" do
      expect {
        PersonRelation::Github.find_or_create_friends person
        person.reload
      }.to change(PersonRelation::Github, :count).by 2

      expect(person.friends).to     include target_person1
      expect(person.friends).to     include target_person2
      expect(person.friends).not_to include target_person3
    end

    it "should create one-way friendships" do
      PersonRelation::Github.find_or_create_friends person
      person.reload

      expect(target_person1.friends).to be_empty
      expect(target_person2.friends).to be_empty
      expect(target_person3.friends).to be_empty
    end

    it "should not create duplicate relations" do
      expect {
        10.times { PersonRelation::Github.find_or_create_friends person }
        person.reload
      }.to change(PersonRelation::Github, :count).by 2
    end

    describe "adding new friends after initial load" do
      let(:person) { create(:person_with_github_account) }
      let(:old_friend) { create(:person_with_github_account) }
      let(:new_friend) { create(:person) }

      before do
        # fake the API response from Facebook for initial check
        allow(person.github_account).to receive(:following_logins).and_return [old_friend.github_account.login]

        # initial adding of friends, won't pickup new_user because there is no associated github_account yet
        PersonRelation::Github.find_or_create_friends person
        person.reload

        # create a Facebook user on new_friend, simulating the linking of a facebook account
        create(:github_account, person: new_friend)
        new_friend.reload

        # now, update the mock API response
        allow(person.github_account).to receive(:following_logins) do
          [old_friend, new_friend].map(&:github_account).map(&:login)
        end
      end

      it "should ensure that new user is not a friend yet" do
        expect(person.friends).to     include old_friend
        expect(person.friends).not_to include new_friend
      end

      it "should add new user as a friend" do
        PersonRelation::Github.find_or_create_friends person
        person.reload

        expect(person.friends).to include new_friend
        expect(new_friend.friends).not_to include person
      end
    end
  end

  # TODO: update this old code to test the new LinkedAccount::Github::User.sync_all_data
  #describe "creating friends after account link" do
  #  let(:person) { create(:person) }
  #  let(:linked_account) { create(:github_account) }
  #  let(:friend) { create(:person_with_github_account) }
  #
  #  before do
  #    # fake the API response from Twitter
  #    LinkedAccount::Github.any_instance.stub(:sync_all_data)
  #  end
  #
  #  it "should create friend" do
  #    lambda {
  #      linked_account.link_with_person person
  #      person.reload
  #    }.should change(person.friends, :count).by 1
  #
  #    person.friends.should include friend
  #  end
  #end
  #
  #describe "lots of different friends" do
  #  let(:person) { create(:person_with_github_account) }
  #  let(:lots_of_friends) { 50.times.map { create(:person_with_github_account) } }
  #
  #  before do
  #    person.github_account.stub(:following_logins).and_return lots_of_friends.map(&:github_account).map(&:login)
  #  end
  #
  #  it "should add all of the friends" do
  #    person.populate_friends
  #    person.reload
  #    person.friends.should match_array(lots_of_friends)
  #  end
  #end
  #
  #describe "different people sharing friends" do
  #  let(:snap) { create(:person_with_github_account) }
  #  let(:crackle) { create(:person_with_github_account) }
  #  let(:pop) { create(:person_with_github_account) }
  #  let(:lots_of_friends) { 10.times.map { create(:person_with_github_account) } }
  #
  #  before do
  #    snap.github_account.stub(:following_logins).and_return lots_of_friends.map(&:github_account).map(&:login)
  #    crackle.github_account.stub(:following_logins).and_return lots_of_friends.map(&:github_account).map(&:login)
  #    pop.github_account.stub(:following_logins).and_return lots_of_friends.map(&:github_account).map(&:login)
  #  end
  #
  #  it "should create person_relations for snap crackle and pop" do
  #    snap.populate_friends
  #    crackle.populate_friends
  #    pop.populate_friends
  #
  #    [snap, crackle, pop].map(&:reload)
  #
  #    snap.friends.should     match_array(lots_of_friends)
  #    crackle.friends.should  match_array(lots_of_friends)
  #    pop.friends.should      match_array(lots_of_friends)
  #  end
  #end
  #
  #describe "follow starred repos" do
  #  let(:person) { create(:person) }
  #  let(:linked_account) { create(:github_account, person: person) }
  #  let(:tracker) { create(:github_repository) }
  #
  #  before do
  #    linked_account.stub(:get_starred_repos) do
  #      [{ "html_url" => tracker.url }]
  #    end
  #  end
  #
  #  it "return starred trackers" do
  #    linked_account.get_starred_repos.should_not be_empty
  #  end
  #
  #  it "should follow tracker" do
  #    expect {
  #      linked_account.follow_starred_repos
  #    }.to change(FollowRelation, :count).by 1
  #  end
  #
  #  context "after follow" do
  #    let!(:follow_relation) { person.follow_relations.create(item: tracker, active: false) }
  #
  #    it "should not create new follow relation" do
  #      expect {
  #        linked_account.follow_starred_repos
  #      }.not_to change(FollowRelation, :count)
  #    end
  #
  #    it "should not follow tracker if it was explicitly unfollowed" do
  #      follow_relation.should_not be_active
  #      expect {
  #        linked_account.follow_starred_repos
  #        follow_relation.reload
  #      }.not_to change(follow_relation, :active)
  #    end
  #  end
  #end
end
