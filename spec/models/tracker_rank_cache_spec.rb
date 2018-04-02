# == Schema Information
#
# Table name: tracker_rank_caches
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  tracker_id :integer          not null
#  rank       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_tracker_rank_caches_on_person_id_and_tracker_id  (person_id,tracker_id) UNIQUE
#

require 'spec_helper'

describe TrackerRankCache do

  describe "#update_cache" do
    let(:tracker) { create :tracker }
    let(:person) { create :person }

    #already one event is cached
    let(:tracker_rank_cache) { create :tracker_rank_cache, person: person, tracker: tracker, updated_at: 3.minutes.ago, rank: 1}
    let(:recently_updated_tracker_rank_cache) { create :tracker_rank_cache, person: person, tracker: tracker, updated_at: 1.seconds.ago, rank: 1}

    #person has done 2 actions on the same tracker
    let(:activity_log_1) { create :activity_log, tracker: tracker, person: person, name: "view" }
    let(:activity_log_2) { create :activity_log, tracker: tracker, person: person, name: "follow" }

    context "with an existing TrackerRankCache object" do

      context "that was not recently updated" do
        it "should update the cached count" do
          tracker_rank_cache
          activity_log_1
          activity_log_2
          activity_log_2.update_caches

          tracker_rank_cache.reload
          expect(tracker_rank_cache.rank).to eq(2)
        end
      end

      context "that was recently updated" do
        it "should NOT update the cached rank" do
          expect {
            recently_updated_tracker_rank_cache
            activity_log_1
            activity_log_2
            activity_log_2.update_caches
            activity_log_2.update_caches
            recently_updated_tracker_rank_cache.reload
          }.not_to change(recently_updated_tracker_rank_cache, :rank)
        end
      end

    end

    context "with NO exsiting TrackerRankCache object" do
      it "should create a new TrackerRankCache object" do
        expect {
          activity_log_1
          activity_log_1.update_caches
        }.to change(TrackerRankCache, :count).by 1
      end
    end
  end
end
