# == Schema Information
#
# Table name: issues
#
#  id                       :integer          not null, primary key
#  github_pull_request_id   :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  number                   :integer
#  url                      :string(255)      not null
#  title                    :text
#  labels                   :string(255)
#  code                     :boolean          default(FALSE)
#  state                    :string(255)
#  body                     :text
#  remote_updated_at        :datetime
#  remote_id                :integer
#  tracker_id               :integer
#  solution_id              :integer
#  featured                 :boolean          default(FALSE), not null
#  remote_created_at        :datetime
#  synced_at                :datetime
#  comment_count            :integer          default(0)
#  sync_in_progress         :boolean          default(FALSE), not null
#  bounty_total             :decimal(10, 2)   default(0.0), not null
#  type                     :string(255)      default("Issue"), not null
#  remote_type              :string(255)
#  priority                 :string(255)
#  milestone                :string(255)
#  can_add_bounty           :boolean          default(FALSE), not null
#  accepted_bounty_claim_id :integer
#  author_name              :string(255)
#  owner                    :string(255)
#  paid_out                 :boolean          default(FALSE), not null
#  participants_count       :integer
#  thumbs_up_count          :integer
#  votes_count              :integer
#  watchers_count           :integer
#  severity                 :string(255)
#  delta                    :boolean          default(TRUE), not null
#  author_linked_account_id :integer
#  solution_started         :boolean          default(FALSE), not null
#  body_markdown            :text
#  deleted_at               :datetime
#
# Indexes
#
#  index_issues_on_comment_count                  (comment_count)
#  index_issues_on_delta                          (delta)
#  index_issues_on_featured                       (featured)
#  index_issues_on_remote_id                      (remote_id)
#  index_issues_on_solution_started               (solution_started)
#  index_issues_on_tracker_id_and_bounty_total    (tracker_id,bounty_total)
#  index_issues_on_type                           (type)
#  index_issues_on_url                            (url) UNIQUE
#  index_issues_on_votes_count                    (votes_count)
#  index_issues_on_watchers_count                 (watchers_count)
#  index_issues_partial_author_linked_account_id  (author_linked_account_id)
#  index_issues_partial_bounty_total              (bounty_total)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count)
#

require 'spec_helper'

describe Issue do
  let!(:person) { create(:person) }
  let(:issue) { create(:issue) }

  describe '#find_by_url' do
    let(:url) { "http://www.somewhere.com/issues/1" }
    let(:issue) { create(:issue) }
    let(:alternate_urls) {
      [
        "http://www.somewhere.com/issues/1",
        "http://www.somewhere.com/issues/1/",
        "https://www.somewhere.com/issues/1",
        "https://www.somewhere.com/issues/1/"
      ]
    }
    let(:result) { Issue.find_by_url(url) }
    let(:html) { "html" }
    describe 'with existing issue' do
      before do
        expect(Issue).to receive(:where).with(url: alternate_urls).and_return([issue])
      end
      it "should return that issue" do
        expect(result).to eq(issue)
      end
    end

    describe 'without existing issue' do
      before do
        expect(Issue).to receive(:where).with(url: alternate_urls).and_return([])
      end
      it "should try to create new issue" do
        expect(result).to eq(nil)
      end
    end
  end

  describe '.find_or_create_by_url' do
    let(:url) { "http://www.google.com/issue/123" }
    let(:alternate_url) { "http://www.google.com/issue/123/" }
    let(:not_exist_url) { "http://www.unique.com" }
    let!(:issue) { create(:issue, url: url) }
    it "should return issue by url" do
      expect(Issue.find_or_create_by_url(url)).to eq(issue)
    end

    it "should return issue by alternate url" do
      expect(Issue.find_or_create_by_url(alternate_url)).to eq(issue)
    end

    it "should create new issue if not exist" do
      expect(Issue.find_or_create_by_url(not_exist_url).url).to eq(not_exist_url)
    end
  end

  describe "bounty total" do
    let!(:issue) { create(:issue) }
    let!(:active_bounty) { create_bounty(100, issue: issue) }
    let!(:refunded_bounty) {
      bounty = create_bounty(100, issue: issue)
      bounty.refund!
      bounty
    }

    it "should have correct statuses" do
      expect(active_bounty).to be_active
      expect(refunded_bounty).to be_refunded
    end

    it "should not include refunded bounty in valuable bounties" do
      expect(issue.bounties.valuable).not_to include refunded_bounty
    end

    it "should only include active bounties in bounty total" do
      issue.update_bounty_total
      expect(issue.bounty_total).to eq(100)
    end
  end

  describe "destroy and merge into new issue" do
    let!(:old_issue) { create(:issue) }
    let!(:new_issue) { create(:issue) }

    let!(:old_bounty) { create(:bounty, amount: 100, issue: old_issue) }
    let!(:old_bounty_claim) { create(:bounty_claim, issue: old_issue) }

    let!(:new_bounty) { create(:bounty, amount: 100, issue: old_issue) }
    let!(:new_bounty_claim) { create(:bounty_claim, issue: old_issue) }

    it "should destroy old issue" do
      expect {
        new_issue.merge!(old_issue)
      }.to change(Issue, :count).by(-1)
    end

    it "should move bounties" do
      new_issue.merge!(old_issue)

      expect(new_issue.reload.bounties).to include old_bounty
      expect(new_issue.bounties).to include new_bounty
      expect(new_issue.bounty_total).to eq(old_bounty.amount + new_bounty.amount)
    end

    it "should move bounty claims" do
      new_issue.merge!(old_issue)

      expect(new_issue.reload.bounty_claims).to include old_bounty_claim
      expect(new_issue.bounty_claims).to include new_bounty_claim
    end

    it "should move comments" do
      comment = create(:comment, issue: old_issue)
      new_issue.merge!(old_issue)
      expect(new_issue.reload.comments).to include comment
    end

    it "should move developer_goals" do
      developer_goal = create(:developer_goal, issue: old_issue, amount: 1000)
      new_issue.merge!(old_issue)
      expect(new_issue.reload.developer_goals).to include developer_goal
    end

    it "should move solutions" do
      solution = create(:solution, issue: old_issue)
      new_issue.merge!(old_issue)
      expect(new_issue.reload.solutions).to include solution
    end

    it "should move author" do
      github_account = create(:github_account)
      old_issue.update_attribute :author, github_account

      new_issue.merge!(old_issue)
      expect(new_issue.reload.author).to eq(github_account)
    end
  end
end
