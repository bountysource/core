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

describe PersonRelation::Facebook do
  let!(:person) { create(:person) }
  let!(:target_person) { create(:person) }
  let(:person_relation_facebook) { create(:person_relation_facebook, person: person, target_person: target_person) }

  it "should link person to target person" do
    expect {
      r = PersonRelation::Facebook.create person: person, target_person: target_person
      expect(r.person).to eq(person)
      expect(r.target_person).to eq(target_person)
    }.to change(PersonRelation::Facebook, :count).by 1
  end

  it "should make target appear in person's friend list" do
    expect(person_relation_facebook.person.friends).to include target_person
  end

  it "should not make person appear in target person's friend list" do
    expect(person_relation_facebook.target_person.friends).not_to include person
  end

  describe "finding friends" do
    let(:person) { create(:person_with_facebook_account) }
    let(:target_person1) { create(:person_with_facebook_account) }
    let(:target_person2) { create(:person_with_facebook_account) }
    let(:target_person3) { create(:person) }

    before do
      # fake the API response from Facebook
      allow(person.facebook_account).to receive(:friends) do
        # turn the people's linked accounts into hashes resembling those returned from facebook API
        [target_person1, target_person2].map(&:facebook_account).map do |la|
          {
            'id'    => la.uid,
            'name'  => "#{la.person.first_name} #{la.person.last_name}".strip
          }
        end
      end
    end

    it "should create the correct friend relations" do
      expect {
        PersonRelation::Facebook.find_or_create_friends person
        person.reload
      }.to change(PersonRelation::Facebook, :count).by 2

      expect(person.friends).to     include target_person1
      expect(person.friends).to     include target_person2
      expect(person.friends).not_to include target_person3
    end

    it "should create one-way friendships" do
      PersonRelation::Facebook.find_or_create_friends person
      person.reload

      expect(target_person1.friends).to be_empty
      expect(target_person2.friends).to be_empty
      expect(target_person3.friends).to be_empty
    end

    it "should not create duplicate relations" do
      expect {
        10.times { PersonRelation::Facebook.find_or_create_friends person }
        person.reload
      }.to change(PersonRelation::Facebook, :count).by 2
    end

    describe "adding new friends after initial load" do
      let(:person) { create(:person_with_facebook_account) }
      let(:old_friend) { create(:person_with_facebook_account) }
      let(:new_friend) { create(:person) }

      before do
        # fake the API response from Facebook for initial check
        allow(person.facebook_account).to receive(:friends).and_return(
          [
            {
              'id'    => old_friend.facebook_account.uid,
              'name'  => "Leeroy Jenkins"
            }
          ]
        )

        # initial adding of friends, won't pickup new_user because there is no associated facebook_account yet
        PersonRelation::Facebook.find_or_create_friends person
        person.reload

        # create a Facebook user on new_friend, simulating the linking of a facebook account
        create(:facebook_account, person: new_friend)
        new_friend.reload

        # now, update the mock API response
        allow(person.facebook_account).to receive(:friends) do
          [old_friend, new_friend].map(&:facebook_account).map do |la|
            {
              'id'    => la.uid,
              'name'  => "#{la.person.first_name} #{la.person.last_name}".strip
            }
          end
        end
      end

      it "should ensure that new user is not a friend yet" do
        expect(person.friends).to     include old_friend
        expect(person.friends).not_to include new_friend
      end

      it "should add new user as a friend" do
        PersonRelation::Facebook.find_or_create_friends person
        person.reload

        expect(person.friends).to include new_friend
        expect(new_friend.friends).not_to include person
      end
    end
  end

  describe "creating friends after account link" do
    let(:person) { create(:person) }
    let(:linked_account) { create(:facebook_account) }
    let(:friend) { create(:person_with_facebook_account) }

    before do
      # fake the API response from Facebook
      allow_any_instance_of(LinkedAccount::Facebook).to receive(:friends).and_return(
        [{
          'id'    => friend.facebook_account.uid,
          'name'  => "#{friend.facebook_account.first_name} #{friend.facebook_account.last_name}"
        }]
      )
    end

    it "should create friends" do
      expect {
        linked_account.link_with_person person
        person.reload
      }.to change(person.friends, :count).by 1

      expect(person.friends).to include friend
    end
  end
end
