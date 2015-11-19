# == Schema Information
#
# Table name: person_relations
#
#  id               :integer          not null, primary key
#  type             :string(255)      not null
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

describe PersonRelation::Twitter do
  let!(:person) { create(:person) }
  let!(:target_person) { create(:person) }
  let(:person_relation_twitter) { create(:person_relation_twitter, person: person, target_person: target_person) }

  it "should link person to target person" do
    lambda {
      r = PersonRelation::Twitter.create person: person, target_person: target_person
      r.person.should == person
      r.target_person.should == target_person
    }.should change(PersonRelation::Twitter, :count).by 1
  end

  it "should make target appear in person's friend list" do
    person_relation_twitter.person.friends.should include target_person
  end

  it "should not make person appear in target person's friend list" do
    person_relation_twitter.target_person.friends.should_not include person
  end

  describe "finding friends" do
    let(:person) { create(:person_with_twitter_account) }
    let(:target_person1) { create(:person_with_twitter_account) }
    let(:target_person2) { create(:person_with_twitter_account) }
    let(:target_person3) { create(:person) }

    before do
      # fake the API response from Twitter
      person.twitter_account.stub(:friend_ids) do
        # turn the people's linked accounts into hashes resembling those returned from facebook API
        [target_person1, target_person2].map(&:twitter_account).map(&:uid)
      end
    end

    it "should create the correct friend relations" do
      lambda {
        PersonRelation::Twitter.find_or_create_friends person
        person.reload
      }.should change(PersonRelation::Twitter, :count).by 2

      person.friends.should     include target_person1
      person.friends.should     include target_person2
      person.friends.should_not include target_person3
    end

    it "should create one-way friendships" do
      PersonRelation::Twitter.find_or_create_friends person
      person.reload

      target_person1.friends.should be_empty
      target_person2.friends.should be_empty
      target_person3.friends.should be_empty
    end

    it "should not create duplicate relations" do
      lambda {
        10.times { PersonRelation::Twitter.find_or_create_friends person }
        person.reload
      }.should change(PersonRelation::Twitter, :count).by 2
    end

    describe "adding new friends after initial load" do
      let(:person) { create(:person_with_twitter_account) }
      let(:old_friend) { create(:person_with_twitter_account) }
      let(:new_friend) { create(:person) }

      before do
        # fake the API response from Facebook for initial check
        person.twitter_account.stub(:friend_ids).and_return [old_friend.twitter_account.uid]

        # initial adding of friends, won't pickup new_user because there is no associated twitter_account yet
        PersonRelation::Twitter.find_or_create_friends person
        person.reload

        # create a Facebook user on new_friend, simulating the linking of a facebook account
        create(:twitter_account, person: new_friend)
        new_friend.reload

        # now, update the mock API response
        person.twitter_account.stub(:friend_ids) do
          [old_friend, new_friend].map(&:twitter_account).map(&:uid)
        end
      end

      it "should ensure that new user is not a friend yet" do
        person.friends.should     include old_friend
        person.friends.should_not include new_friend
      end

      it "should add new user as a friend" do
        PersonRelation::Twitter.find_or_create_friends person
        person.reload

        person.friends.should include new_friend
        new_friend.friends.should_not include person
      end
    end
  end

  describe "creating friends after account link" do
    let(:person) { create(:person) }
    let(:linked_account) { create(:twitter_account) }
    let(:friend) { create(:person_with_twitter_account) }

    before do
      # fake the API response from Twitter
      LinkedAccount::Twitter.any_instance.stub(:friend_ids).and_return [friend.twitter_account.uid]
    end

    it "should create friend" do
      lambda {
        linked_account.link_with_person person
        person.reload
      }.should change(person.friends, :count).by 1

      person.friends.should include friend
    end
  end
end
