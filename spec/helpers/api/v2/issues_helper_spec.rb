require 'spec_helper'

# Specs in this file have access to a helper object that includes
# the Api::V2::IssuesHelper. For example:
#
# describe Api::V2::IssuesHelper do
#   describe "string concat" do
#     it "concats two strings with spaces" do
#       expect(helper.concat_strings("this","that")).to eq("this that")
#     end
#   end
# end
describe Api::V2::IssuesHelper do

  describe "filter" do

    let(:params) { {} }
    let(:current_user) { nil }
    let(:filtered) { filter!(Issue.all) }

    it "should filter by tracker id" do
      issue1 = create(:issue)
      issue2 = create(:issue)

      params.merge!(tracker_id: issue1.tracker.id)

      filtered.should include issue1
      filtered.should_not include issue2
    end

    it "should filter by can_add_bounty" do
      issue1 = create(:issue, can_add_bounty: true)
      issue2 = create(:issue, can_add_bounty: false)

      params.merge!(can_add_bounty: true)

      filtered.should include issue1
      filtered.should_not include issue2
    end

    it "should filter by featured" do
      issue1 = create(:issue, featured: true)
      issue2 = create(:issue, featured: false)

      params.merge!(featured: true)

      filtered.should include issue1
      filtered.should_not include issue2
    end

    describe "convert 'tracker_type' param into constant names" do

      it "translates github" do
        tracker_constant_names_for_type('github').should match_array %w(Github::Repository)
      end

      it "translates bitbucket" do
        tracker_constant_names_for_type('bitbucket').should match_array %w(Bitbucket::Tracker)
      end

      it "translates bugzilla" do
        tracker_constant_names_for_type('bugzilla').should match_array %w(Bugzilla::Tracker)
      end

      it "translates google" do
        tracker_constant_names_for_type('google').should match_array %w(GoogleCode::Tracker)
      end

      it "translates jira" do
        tracker_constant_names_for_type('jira').should match_array %w(Jira::Tracker)
      end

      it "translates launchpad" do
        tracker_constant_names_for_type('launchpad').should match_array %w(Launchpad::Tracker)
      end

      it "translates pivotal" do
        tracker_constant_names_for_type('pivotal').should match_array %w(Pivotal::Tracker)
      end

      it "translates sourceforge" do
        tracker_constant_names_for_type('sourceforge').should match_array %w(SourceForge::Tracker SourceForgeNative::Tracker)
      end

      it "translates trac" do
        tracker_constant_names_for_type('trac').should match_array %w(Trac::Tracker)
      end
    end

    describe "tracker type" do

      let!(:github_issue) { create(:github_issue) }
      let!(:bitbucket_issue) { create(:bitbucket_issue) }
      let!(:bugzilla_issue) { create(:bugzilla_issue) }
      let!(:google_issue) { create(:googlecode_issue) }
      let!(:jira_issue) { create(:jira_issue) }
      let!(:launchpad_issue) { create(:launchpad_issue) }
      let!(:pivotal_issue) { create(:pivotal_issue) }
      let!(:sourceforge_issue) { create(:sourceforge_issue) }
      let!(:sourceforge_native_issue) { create(:sourceforge_native_issue) }
      let!(:trac_issue) { create(:trac_issue) }

      it "should only include github issues" do
        params.merge!(tracker_type: 'github')
        filtered.should match_array [github_issue]
      end

      it "should only include bitbucket issues" do
        params.merge!(tracker_type: 'bitbucket')
        filtered.should match_array [bitbucket_issue]
      end

      it "should only include bugzilla issues" do
        params.merge!(tracker_type: 'bugzilla')
        filtered.should match_array [bugzilla_issue]
      end

      it "should only include google issues" do
        params.merge!(tracker_type: 'google')
        filtered.should match_array [google_issue]
      end

      it "should only include jira issues" do
        params.merge!(tracker_type: 'jira')
        filtered.should match_array [jira_issue]
      end

      it "should only include launchpad issues" do
        params.merge!(tracker_type: 'launchpad')
        filtered.should match_array [launchpad_issue]
      end

      it "should only include pivotal issues" do
        params.merge!(tracker_type: 'pivotal')
        filtered.should match_array [pivotal_issue]
      end

      it "should only include sourceforge issues" do
        params.merge!(tracker_type: 'sourceforge')
        filtered.should match_array [sourceforge_issue, sourceforge_native_issue]
      end

      it "should only include trac issues" do
        params.merge!(tracker_type: 'trac')
        filtered.should match_array [trac_issue]
      end

    end

  end

  describe "sort" do

    let(:params) { { direction: 'desc' } }
    let(:ordered) { order!(Issue.all) }

    describe "ordering" do

      it "should parse as descending" do
        _direction_for_order_value('+rank').should be == 'desc'
      end

      it "should parse as ascending" do
        _direction_for_order_value('-rank').should be == 'asc'
      end

      it "should default to descending" do
        _direction_for_order_value('rank').should be == 'desc'
      end

    end

    # describe 'request_for_proposal' do
    #   let!(:issue1) { create(:issue) }
    #   let!(:issue2) { create(:issue) }
    #   let!(:request_for_proposal) { create(:request_for_proposal, issue: issue1) }
    #
    #   it 'should sort by request_for_proposal count descending' do
    #     params.merge!(order: '+request_for_proposal')
    #     expect(ordered.first.request_for_proposal).to be_a(RequestForProposal)
    #   end
    #
    #   # it 'should sort should sort by request_for_proposal count ascending' do
    #   #   # this test aint working. will revisit
    #   #   params.merge!(order: '-request_for_proposal')
    #   #   expect(ordered.first.request_for_proposal).to be_nil
    #   # end
    # end

    describe "team rank" do

      let(:team) { create(:team) }

      let!(:issue1) { create(:issue, owner: team) }
      let!(:issue2) { create(:issue, owner: team) }
      let!(:issue3) { create(:issue, owner: team) }

      let!(:issue1_rank) { team.issue_ranks.create(issue: issue1, rank: 1) }
      let!(:issue2_rank) { team.issue_ranks.create(issue: issue2, rank: 2) }
      let!(:issue3_rank) { team.issue_ranks.create(issue: issue3, rank: 3) }

      # it "should transform collection into IssueRank models" do
      #   params.merge!(
      #     team_id: team.id,
      #     order: 'team_rank'
      #   )
      #   ordered.first.should be_a IssueRank
      # end
      #
      # it "should sort by team issue rank descending" do
      #   params.merge!(
      #     team_id: team.id,
      #     order: '+team_rank'
      #   )
      #   ordered.should match_array [issue3_rank, issue2_rank, issue1_rank]
      # end
      #
      # it "should sort by team issue rank ascending" do
      #   params.merge!(
      #     team_id: team.id,
      #     order: '-team_rank'
      #   )
      #   ordered.should match_array [issue1_rank, issue2_rank, issue3_rank]
      # end

    end

    # describe "linked_account rank" do
    #
    #   let(:linked_account) { create(:github_account) }
    #
    #   let!(:issue1) { create(:issue, owner: linked_account) }
    #   let!(:issue2) { create(:issue, owner: linked_account) }
    #   let!(:issue3) { create(:issue, owner: linked_account) }
    #
    #   let!(:issue1_rank) { linked_account.issue_ranks.create(issue: issue1, rank: 1) }
    #   let!(:issue2_rank) { linked_account.issue_ranks.create(issue: issue2, rank: 2) }
    #   let!(:issue3_rank) { linked_account.issue_ranks.create(issue: issue3, rank: 3) }
    #
    #   it "should sort by linked account issue rank descending" do
    #     params.merge!(
    #       linked_account_id: linked_account.id,
    #       order: '+linked_account_rank'
    #     )
    #     ordered.should match_array [issue3_rank, issue2_rank, issue1_rank]
    #   end
    #
    #   it "should sort by linked account issue rank ascending" do
    #     params.merge!(
    #       linked_account_id: linked_account.id,
    #       order: '-linked_account_rank'
    #     )
    #     ordered.should match_array [issue1_rank, issue2_rank, issue3_rank]
    #   end
    #
    # end

    # describe "global rank" do
    #
    #   let!(:issue1) { create(:issue) }
    #   let!(:issue2) { create(:issue) }
    #   let!(:issue3) { create(:issue) }
    #
    #   let!(:issue1_rank) { create(:issue_rank, issue: issue1, rank: 1) }
    #   let!(:issue2_rank) { create(:issue_rank, issue: issue2, rank: 2) }
    #   let!(:issue3_rank) { create(:issue_rank, issue: issue3, rank: 3) }
    #
    #   it "should sort by global issue rank descending" do
    #     params.merge!(order: '+rank')
    #     ordered.should match_array [issue3_rank, issue2_rank, issue1_rank]
    #   end
    #
    #   it "should sort by global issue rank ascending" do
    #     params.merge!(order: '-rank')
    #     ordered.should match_array [issue1_rank, issue2_rank, issue3_rank]
    #   end
    #
    # end

    describe "bounty" do

      let!(:issue1) { create(:issue, bounty_total: 1) }
      let!(:issue2) { create(:issue, bounty_total: 2) }
      let!(:issue3) { create(:issue, bounty_total: 3) }

      it "should sort by bounty total descending" do
        params.merge!(order: '+bounty')
        ordered.should match_array [issue3, issue2, issue1]
      end

      it "should sort by bounty total ascending" do
        params.merge!(order: '-bounty')
        ordered.should match_array [issue1, issue2, issue3]
      end

    end

    describe "comments" do

      let!(:issue1) { create(:issue, comment_count: 1) }
      let!(:issue2) { create(:issue, comment_count: 2) }
      let!(:issue3) { create(:issue, comment_count: 3) }

      it "should sort by comments descending" do
        params.merge!(order: '+comments')
        ordered.should match_array [issue3, issue2, issue1]
      end

      it "should sort by comments ascending" do
        params.merge!(order: '-comments')
        ordered.should match_array [issue1, issue2, issue3]
      end

    end

    describe "participants" do

      let!(:issue1) { create(:issue, participants_count: 1) }
      let!(:issue2) { create(:issue, participants_count: 2) }
      let!(:issue3) { create(:issue, participants_count: 3) }

      it "should sort by participants descending" do
        params.merge!(order: '+participants')
        ordered.should match_array [issue3, issue2, issue1]
      end

      it "should sort by participants ascending" do
        params.merge!(order: '-participants')
        ordered.should match_array [issue1, issue2, issue3]
      end

    end

    describe "thumbs" do

      let!(:issue1) { create(:issue, thumbs_up_count: 1) }
      let!(:issue2) { create(:issue, thumbs_up_count: 2) }
      let!(:issue3) { create(:issue, thumbs_up_count: 3) }

      it "should sort by thumbs up descending" do
        params.merge!(order: '+thumbs')
        ordered.should match_array [issue3, issue2, issue1]
      end

      it "should sort by thumbs up ascending" do
        params.merge!(order: '-thumbs')
        ordered.should match_array [issue1, issue2, issue3]
      end

    end

    describe "votes" do

      let!(:issue1) { create(:issue, votes_count: 1) }
      let!(:issue2) { create(:issue, votes_count: 2) }
      let!(:issue3) { create(:issue, votes_count: 3) }

      it "should sort by votes descending" do
        params.merge!(order: '+votes')
        ordered.should match_array [issue3, issue2, issue1]
      end

      it "should sort by votes ascending" do
        params.merge!(order: '-votes')
        ordered.should match_array [issue1, issue2, issue3]
      end

    end

    describe "created" do

      let!(:issue1) { create(:issue, remote_created_at: 1.month.ago) }
      let!(:issue2) { create(:issue, remote_created_at: 2.months.ago) }
      let!(:issue3) { create(:issue, remote_created_at: 3.months.ago) }

      it "should sort by remote created at descending" do
        params.merge!(order: '+created')
        ordered.should match_array [issue3, issue2, issue1]
      end

      it "should sort by remote created at ascending" do
        params.merge!(order: '-created')
        ordered.should match_array [issue1, issue2, issue3]
      end

    end

    describe "updated" do

      let!(:issue1) { create(:issue, remote_updated_at: 1.month.ago) }
      let!(:issue2) { create(:issue, remote_updated_at: 2.months.ago) }
      let!(:issue3) { create(:issue, remote_updated_at: 3.months.ago) }

      it "should sort by remote updated at descending" do
        params.merge!(order: '+updated')
        ordered.should match_array [issue3, issue2, issue1]
      end

      it "should sort by remote updated at ascending" do
        params.merge!(order: '-updated')
        ordered.should match_array [issue1, issue2, issue3]
      end

    end

  end

end
