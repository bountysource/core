# == Schema Information
#
# Table name: fundraiser_tracker_relations
#
#  id            :integer          not null, primary key
#  fundraiser_id :integer          not null
#  tracker_id    :integer          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_fundraiser_tracker_relations_on_ids  (fundraiser_id,tracker_id) UNIQUE
#

require 'spec_helper'

describe FundraiserTrackerRelation do
  
  let(:tracker) { create(:tracker) }
  let(:tracker_2) { create(:tracker) }
  let(:fundraiser) { create(:fundraiser) }
  let(:fundraiser_tracker_relation) { create(:fundraiser_tracker_relation, tracker: tracker, fundraiser: fundraiser) }

  describe "when testing validations" do
    it "should not be valid if its missing a fundraiser" do
      relation = build(:fundraiser_tracker_relation, fundraiser: nil, tracker: tracker)
      expect(relation).not_to be_valid
    end

    it "should not be valid if its missing a tracker" do
      relation = build(:fundraiser_tracker_relation, fundraiser: fundraiser, tracker: nil)
      expect(relation).not_to be_valid
    end

    it "should not allow duplicate relations between a tracker and fundraiser" do
      fundraiser_tracker_relation #initialize object
      relation = build(:fundraiser_tracker_relation, fundraiser: fundraiser, tracker: tracker)
      expect(relation).not_to be_valid
    end
  end

  describe "when testing associations" do
    it "should be able to call associated trackers and fundraisers" do
      expect(fundraiser_tracker_relation.tracker.id).to eq(tracker.id)
      expect(fundraiser_tracker_relation.fundraiser.id).to eq(fundraiser.id)
    end

    it "should give a fundraiser many trackers" do
      fundraiser_tracker_relation
      expect(fundraiser.trackers.first.id).to eq(tracker.id)
    end

    it "should give a tracker many fundraisers" do
      fundraiser_tracker_relation
      expect(tracker.fundraisers.first.id).to eq(fundraiser.id)
    end
  end

  describe "when creating a tracker relation for a fundraiser" do
    it "should be able to create a relation" do
      expect {
        fundraiser.fundraiser_tracker_relations.create(tracker: tracker_2)
        fundraiser.reload
      }.to change(fundraiser.trackers, :count).by 1
    end
  end
end
