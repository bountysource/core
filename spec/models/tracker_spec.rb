# == Schema Information
#
# Table name: trackers
#
#  id                   :integer          not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  remote_id            :integer
#  url                  :string(255)      not null
#  name                 :string(255)      not null
#  full_name            :string(255)
#  is_fork              :boolean          default(FALSE)
#  watchers             :integer          default(0), not null
#  forks                :integer          default(0)
#  pushed_at            :datetime
#  description          :text
#  featured             :boolean          default(FALSE), not null
#  open_issues          :integer          default(0), not null
#  synced_at            :datetime
#  project_tax          :decimal(9, 4)    default(0.0)
#  has_issues           :boolean          default(TRUE), not null
#  has_wiki             :boolean          default(FALSE), not null
#  has_downloads        :boolean          default(FALSE), not null
#  private              :boolean          default(FALSE), not null
#  homepage             :string(255)
#  sync_in_progress     :boolean          default(FALSE), not null
#  bounty_total         :decimal(10, 2)   default(0.0), not null
#  account_balance      :decimal(10, 2)   default(0.0)
#  type                 :string(255)      default("Tracker"), not null
#  cloudinary_id        :string(255)
#  closed_issues        :integer          default(0), not null
#  delta                :boolean          default(TRUE), not null
#  can_edit             :boolean          default(TRUE), not null
#  repo_url             :text
#  rank                 :integer          default(0), not null
#  remote_cloudinary_id :string(255)
#  remote_name          :string(255)
#  remote_description   :text
#  remote_homepage      :string(255)
#  remote_language_ids  :integer          default([]), is an Array
#  language_ids         :integer          default([]), is an Array
#  team_id              :integer
#  deleted_at           :datetime
#
# Indexes
#
#  index_trackers_on_bounty_total   (bounty_total)
#  index_trackers_on_closed_issues  (closed_issues)
#  index_trackers_on_delta          (delta)
#  index_trackers_on_open_issues    (open_issues)
#  index_trackers_on_rank           (rank)
#  index_trackers_on_remote_id      (remote_id)
#  index_trackers_on_team_id        (team_id)
#  index_trackers_on_type           (type)
#  index_trackers_on_url            (url) UNIQUE
#  index_trackers_on_watchers       (watchers)
#

require 'spec_helper'

describe Tracker do
  describe 'validations' do
    let(:invalid_tracker) { build(:tracker, url: "http://www.tracker.com") }
    let(:valid_tracker1) { build(:tracker, url: "http://www.tracker.com/") }
    let(:valid_tracker2) { build(:tracker, url: "http://www.tracker.com/testing") }
    let(:valid_tracker3) { build(:tracker, url: "http://www.tracker.com/testing/") }
    it "should require trailing space" do
      expect(valid_tracker1).to be_valid
      expect(valid_tracker2).to be_valid
      expect(valid_tracker3).to be_valid
    end

    it "should add trailing space to host name" do
      expect(invalid_tracker).to be_valid
      expect(invalid_tracker.url).to eq("http://www.tracker.com/")
    end
  end

  describe '#find_by_url' do
    let(:url) { "http://www.somewhere.com/issues/" }
    let(:tracker) { create(:tracker) }
    let(:alternate_urls) {
      [
        "http://www.somewhere.com/issues",
        "http://www.somewhere.com/issues/",
        "https://www.somewhere.com/issues",
        "https://www.somewhere.com/issues/"
      ]
    }
    let(:result) { Tracker.find_by_url(url) }
    let(:html) { "html" }
    describe 'with existing tracker' do
      before do
        Tracker.should_receive(:where).with(url: alternate_urls).and_return([tracker])
      end
      it "should return that issue" do
        expect(result).to eq(tracker)
      end
    end

    describe 'without existing tracker' do
      before do
        Tracker.should_receive(:where).with(url: alternate_urls).and_return([])
      end
      it "should try to create new tracker" do
        expect(result).to eq(nil)
      end
    end
  end

  describe "destroy and merge" do
    let!(:old_tracker) { create(:tracker, url: "https://github.com/old/repo", full_name: "old/repo") }
    let!(:new_tracker) { create(:tracker, url: "https://github.com/new/repo", full_name: "new/repo") }

    it "should destroy old tracker" do
      expect {
        new_tracker.merge!(old_tracker)
      }.to change(Tracker, :count).by(-1)
    end

    it "should move languages to new tracker" do
      language = create(:language, name: "Ruby")
      old_tracker.add_language(language)

      new_tracker.merge!(old_tracker)

      new_tracker.reload.languages.should include language
    end

    it "should move owner to new tracker" do
      owner = create(:team)
      old_tracker.set_owner(owner)

      new_tracker.merge!(old_tracker)

      new_tracker.reload.team.should be == owner
    end

    it "should move plugin" do
      plugin = create(:tracker_plugin, tracker: old_tracker)

      new_tracker.merge!(old_tracker)

      new_tracker.reload.plugin.should be == plugin
    end

    it "should move team relations" do
      team = create(:team)
      team_relation = old_tracker.team_relations.create(team: team)

      new_tracker.merge!(old_tracker)

      new_tracker.reload.team_relations.should include team_relation
    end

    it "should move follow relations" do
      follower = create(:person)
      follow_relation = create(:follow_relation, person: follower, item: old_tracker)

      new_tracker.merge!(old_tracker)

      new_tracker.followers.should include follower
      new_tracker.reload.follow_relations.should include follow_relation
    end

    it "should move team relations" do
      team = create(:team, name: 'Doge, inc.', slug: 'doge')
      team.add_tracker(old_tracker)

      new_tracker.merge!(old_tracker)

      team.reload.trackers.should include new_tracker
      team.reload.trackers.should_not include old_tracker
    end

    it "should delete old activity logs" do
      new_tracker.merge!(old_tracker)
      new_tracker.reload.activity_logs.should be_empty
    end

    it "should delete old rank caches" do
      new_tracker.merge!(old_tracker)
      new_tracker.reload.tracker_rank_caches.should be_empty
    end

    it "should move fundraiser_tracker_relations" do
      fundraiser = create(:fundraiser)
      fundraiser.trackers << old_tracker

      new_tracker.merge!(old_tracker)

      new_tracker.reload.fundraisers.should include fundraiser
    end
  end
end
