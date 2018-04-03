# == Schema Information
#
# Table name: issue_rank_caches
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  issue_id   :integer          not null
#  rank       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_issue_rank_caches_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

require 'spec_helper'

describe IssueRankCache do
  describe "#update_cache" do
    let(:tracker) { create :tracker }
    let(:issue) { create :issue, tracker: tracker}
    let(:person) { create :person }

    #already one event is cached
    let(:issue_rank_cache) { create :issue_rank_cache, person: person, issue: issue, updated_at: 3.minutes.ago, rank: 1}
    let(:recently_updated_issue_rank_cache) { create :issue_rank_cache, person: person, issue: issue, updated_at: 1.seconds.ago, rank: 1}

    #person has done 2 actions on the same tracker and issue
    let(:activity_log_1) { create :activity_log, tracker: tracker, issue: issue, person: person, name: "view" }
    let(:activity_log_2) { create :activity_log, tracker: tracker, issue: issue, person: person, name: "start_work" }

    context "with an existing IssueRankCache object" do
      context "that was not recently updated" do
         it "should update the cached count" do
          issue_rank_cache
          activity_log_1
          activity_log_2
          activity_log_2.update_caches
          issue_rank_cache.reload
          expect(issue_rank_cache.rank).to eq(2)
        end
      end

      context "that was RECENTLY updated" do
        it "should NOT update the cached count" do
          expect {
            recently_updated_issue_rank_cache
            activity_log_1
            activity_log_2
            activity_log_2.update_caches
            recently_updated_issue_rank_cache.reload
          }.not_to change(recently_updated_issue_rank_cache, :rank)
        end
      end
    end

    context "with NO existing IssueRankCache object" do
      it "should create a new IssueRankCache object" do
        expect {
          activity_log_1
          activity_log_1.update_caches
        }.to change(IssueRankCache, :count).by 1
      end
    end
  end
end
