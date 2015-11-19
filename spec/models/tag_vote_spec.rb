# == Schema Information
#
# Table name: tag_votes
#
#  id              :integer          not null, primary key
#  person_id       :integer          not null
#  value           :integer          default(0), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  tag_relation_id :integer          not null
#
# Indexes
#
#  index_tag_votes_on_tag_relation_id_and_person_id  (tag_relation_id,person_id) UNIQUE
#

require 'spec_helper'

describe TagVote do

  let(:person)    { create(:person) }
  let(:relation)  { create(:tag_relation) }

  it "should create an upvote" do
    lambda {
      vote = create(:tag_vote, relation: relation, person: person, value: 1)
      vote.should be_upvote
    }.should change(relation.votes, :count).by 1
  end

  it "should create a downvote" do
    lambda {
      vote = create(:tag_vote, relation: relation, person: person, value: -1)
      vote.should be_downvote
    }.should change(relation.votes, :count).by 1
  end

  it "should create a neutral vote" do
    lambda {
      vote = create(:tag_vote, relation: relation, person: person, value: 0)
      vote.should be_neutral
    }.should change(relation.votes, :count).by 1
  end

  it "should not be valid with stupid value" do
    tag = build(:tag_vote, relation: relation, person: person, value: 1337)
    tag.should_not be_valid
    tag.errors.should have_key :value
  end

  it "should only create one vote per person and tag relation" do
    # create first vote
    create(:tag_vote, relation: relation, person: person, value: 1)

    # try to create second vote
    lambda {
      vote = build(:tag_vote, relation: relation, person: person, value: 1)
      vote.should_not be_valid
      vote.errors.should have_key :person_id
    }.should_not change(relation.votes, :count)
  end

  context "with vote" do
    let!(:vote) { TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, 1 }

    it "should not create duplicate vote" do
      lambda {
        TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, 1
      }.should_not change(TagVote, :count)
    end

    it "should find existing vote and update it" do
      # find vote and amend it
      TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, -1
      vote.reload
      vote.value.should == 0
    end

    it "should change the weight of the relation after being updated" do
      lambda {
        # find vote and amend it
        TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, -1
        relation.reload
      }.should change(relation, :weight)
    end
  end

end
