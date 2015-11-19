require 'spec_helper'

# Specs in this file have access to a helper object that includes
# the Api::V2::TrackersHelper. For example:
#
# describe Api::V2::TrackersHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
describe Api::V2::TrackersHelper do

  let(:params) { {} }

  describe "filter" do

    let(:filtered) { filter!(Tracker.all) }

    describe "type" do

      let!(:github) { create(:github_repository) }
      let!(:bitbucket) { create(:bitbucket_tracker) }
      let!(:bugzilla) { create(:bugzilla_tracker) }
      let!(:google) { create(:googlecode_tracker) }
      let!(:jira) { create(:jira_tracker) }
      let!(:launchpad) { create(:launchpad_tracker) }
      let!(:pivotal) { create(:pivotal_tracker) }
      let!(:sourceforge) { create(:sourceforge_tracker) }
      let!(:sourceforge_native) { create(:sourceforge_native_tracker) }
      let!(:trac) { create(:trac_tracker) }

      it "should only include github" do
        params.merge!(type: 'github')
        filtered.should match_array [github]
      end

      it "should only include bitbucket" do
        params.merge!(type: 'bitbucket')
        filtered.should match_array [bitbucket]
      end

      it "should only include bugzilla" do
        params.merge!(type: 'bugzilla')
        filtered.should match_array [bugzilla]
      end

      it "should only include google" do
        params.merge!(type: 'google')
        filtered.should match_array [google]
      end

      it "should only include jira" do
        params.merge!(type: 'jira')
        filtered.should match_array [jira]
      end

      it "should only include launchpad" do
        params.merge!(type: 'launchpad')
        filtered.should match_array [launchpad]
      end

      it "should only include pivotal" do
        params.merge!(type: 'pivotal')
        filtered.should match_array [pivotal]
      end

      it "should only include sourceforge" do
        params.merge!(type: 'sourceforge')
        filtered.should match_array [sourceforge, sourceforge_native]
      end

      it "should only include trac" do
        params.merge!(type: 'trac')
        filtered.should match_array [trac]
      end
    end

    describe "featured" do

      let!(:tracker1) { create(:tracker, featured: true) }
      let!(:tracker2) { create(:tracker, featured: false) }

      it "should include featured only" do
        params.merge!(featured: true)
        filtered.should match_array [tracker1]
      end

      it "should include unfeatured only" do
        params.merge!(featured: false)
        filtered.should match_array [tracker2]
      end

      it "should include both" do
        filtered.should match_array [tracker1, tracker2]
      end

    end

    describe "bounties" do

      let!(:tracker1) { create(:tracker, bounty_total: 100) }
      let!(:tracker2) { create(:tracker, bounty_total: 0) }

      it "should only include tracker with bounties" do
        params.merge!(has_bounties: true)
        filtered.should match_array [tracker1]
      end

      it "should only include tracker without bounties" do
        params.merge!(has_bounties: false)
        filtered.should match_array [tracker2]
      end

      it "should include both" do
        filtered.should match_array [tracker1, tracker2]
      end

    end

  end

  describe "order" do

    let(:filtered) { order!(Tracker.all) }

    describe "bounty_total" do

      let!(:tracker1) { create(:tracker, bounty_total: 100) }
      let!(:tracker2) { create(:tracker, bounty_total: 200) }
      let!(:tracker3) { create(:tracker, bounty_total: 300) }

      it "should sort descending" do
        params.merge!(order: "+bounty_total")
        filtered.should match_array [tracker3, tracker2, tracker1]
      end

      it "should sort ascending" do
        params.merge!(order: "-bounty_total")
        filtered.should match_array [tracker1, tracker2, tracker3]
      end

    end

    describe "open_issues" do

      let!(:tracker1) { create(:tracker, open_issues: 100) }
      let!(:tracker2) { create(:tracker, open_issues: 200) }
      let!(:tracker3) { create(:tracker, open_issues: 300) }

      it "should sort descending" do
        params.merge!(order: "+open_issues")
        filtered.should match_array [tracker3, tracker2, tracker1]
      end

      it "should sort ascending" do
        params.merge!(order: "-open_issues")
        filtered.should match_array [tracker1, tracker2, tracker3]
      end

    end

    describe "closed_issues" do

      let!(:tracker1) { create(:tracker, closed_issues: 100) }
      let!(:tracker2) { create(:tracker, closed_issues: 200) }
      let!(:tracker3) { create(:tracker, closed_issues: 300) }

      it "should sort descending" do
        params.merge!(order: "+closed_issues")
        filtered.should match_array [tracker3, tracker2, tracker1]
      end

      it "should sort ascending" do
        params.merge!(order: "-closed_issues")
        filtered.should match_array [tracker1, tracker2, tracker3]
      end

    end

  end

end
