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
    expect {
      vote = create(:tag_vote, relation: relation, person: person, value: 1)
      expect(vote).to be_upvote
    }.to change(relation.votes, :count).by 1
  end

  it "should create a downvote" do
    expect {
      vote = create(:tag_vote, relation: relation, person: person, value: -1)
      expect(vote).to be_downvote
    }.to change(relation.votes, :count).by 1
  end

  it "should create a neutral vote" do
    expect {
      vote = create(:tag_vote, relation: relation, person: person, value: 0)
      expect(vote).to be_neutral
    }.to change(relation.votes, :count).by 1
  end

  it "should not be valid with stupid value" do
    tag = build(:tag_vote, relation: relation, person: person, value: 1337)
    expect(tag).not_to be_valid
    expect(tag.errors).to have_key :value
  end

  it "should only create one vote per person and tag relation" do
    # create first vote
    create(:tag_vote, relation: relation, person: person, value: 1)

    # try to create second vote
    expect {
      vote = build(:tag_vote, relation: relation, person: person, value: 1)
      expect(vote).not_to be_valid
      expect(vote.errors).to have_key :person_id
    }.not_to change(relation.votes, :count)
  end

  context "with vote" do
    let!(:vote) { TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, 1 }

    it "should not create duplicate vote" do
      expect {
        TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, 1
      }.not_to change(TagVote, :count)
    end

    it "should find existing vote and update it" do
      # find vote and amend it
      TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, -1
      vote.reload
      expect(vote.value).to eq(0)
    end

    it "should change the weight of the relation after being updated" do
      expect {
        # find vote and amend it
        TagVote.find_or_create_by_person_and_relation_and_cast_vote person, relation, -1
        relation.reload
      }.to change(relation, :weight)
    end
  end

end
