# == Schema Information
#
# Table name: issues
#
#  id                       :integer          not null, primary key
#  github_pull_request_id   :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  number                   :integer
#  url                      :string           not null
#  title                    :text
#  labels                   :string
#  code                     :boolean          default(FALSE)
#  state                    :string
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
#  type                     :string           default("Issue"), not null
#  remote_type              :string
#  priority                 :string
#  milestone                :string
#  can_add_bounty           :boolean          default(FALSE), not null
#  accepted_bounty_claim_id :integer
#  author_name              :string
#  owner                    :string
#  paid_out                 :boolean          default(FALSE), not null
#  participants_count       :integer
#  thumbs_up_count          :integer
#  votes_count              :integer
#  watchers_count           :integer
#  severity                 :string
#  delta                    :boolean          default(TRUE), not null
#  author_linked_account_id :integer
#  solution_started         :boolean          default(FALSE), not null
#  body_markdown            :text
#  deleted_at               :datetime
#  category                 :integer
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
#  index_issues_partial_author_linked_account_id  (author_linked_account_id) WHERE (author_linked_account_id IS NOT NULL)
#  index_issues_partial_bounty_total              (bounty_total) WHERE (bounty_total > (0)::numeric)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count) WHERE (COALESCE(thumbs_up_count, 0) > 0)
#

require 'spec_helper'

describe SourceForge::Issue do
  describe '.remote_sync' do
    let(:sourceforge_issue) { create(:sourceforge_issue) }
    let(:data) do
      {
        number: 123,
        title: 'title',
        state: 'open',
        priority: 'high',
        milestone: 'now',
        comments: []
      }
    end
    before do
      expect(SourceForge::API).to receive(:fetch_issue).and_return(data)
    end
    it "should call api and set issue attributes as api returned" do
      expect(sourceforge_issue.remote_sync).to be_truthy
      expect(sourceforge_issue.title).to eq('title')
    end
  end

  describe 'can_add_bounty calculation' do
    let(:method) { SourceForge::API.method(:parse_can_add_bounty) }

    describe 'closed statuses' do
      let(:statuses) do
        statuses = %w(closed)
        statuses += %w(closed).product(SourceForge::API.closed_resolutions).map { |pair| pair.join('-') }
        statuses
      end

      it 'should be false for all' do
        statuses.each do |status|
          expect(method[status]).to be_falsey
        end
      end
    end

    # Note: "Resolutions for this status are the same as for the #Closed status."
    # http://sourceforge.net/apps/mediawiki/jedit/index.php?title=Bug_tracker_details#Status
    describe 'pending statuses' do
      let(:statuses) do
        statuses = %w(pending)
        statuses += %w(pending).product(SourceForge::API.closed_resolutions).map { |pair| pair.join('-') }
        statuses
      end

      it 'should be true for all' do
        statuses.each do |status|
          expect(method[status]).to be_truthy
        end
      end
    end

    # Note: "Sometimes closed resolutions may appear in open status as a signal that it looks like a possible option to close the ticket."
    # http://sourceforge.net/apps/mediawiki/jedit/index.php?title=Bug_tracker_details#Open
    describe 'open statuses' do
      let(:statuses) do
        statuses = %w(open)
        statuses += %w(open).product(SourceForge::API.open_resolutions).map { |pair| pair.join('-') }
        statuses += %w(open).product(SourceForge::API.closed_resolutions).map { |pair| pair.join('-') }
        statuses
      end

      it 'should be true for all' do
        statuses.each do |status|
          expect(method[status]).to be_truthy
        end
      end
    end

    describe 'deleted status' do
      let(:status) { 'deleted' }

      it 'should be false' do
        expect(method[status]).to be_falsey
      end
    end
  end
end
