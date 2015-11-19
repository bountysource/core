# == Schema Information
#
# Table name: request_for_proposals
#
#  id         :integer          not null, primary key
#  issue_id   :integer
#  budget     :decimal(10, 2)
#  due_date   :date
#  created_at :datetime
#  updated_at :datetime
#  person_id  :integer          not null
#  state      :string(255)      default("pending")
#  abstract   :string(1000)
#
# Indexes
#
#  index_request_for_proposals_on_budget     (budget)
#  index_request_for_proposals_on_issue_id   (issue_id)
#  index_request_for_proposals_on_person_id  (person_id)
#

require 'spec_helper'

describe RequestForProposal do
  let(:request_for_proposal) { build(:request_for_proposal, state: 'pending') }

  describe 'validations' do
    it 'should require issue' do
      request_for_proposal.issue = nil
      expect(request_for_proposal).not_to be_valid
      expect(request_for_proposal.errors).to have_key(:issue)
    end

    it 'should allow nil budget' do
      request_for_proposal.budget = nil
      expect(request_for_proposal).to be_valid
    end

    it 'should not allow budget less than 0' do
      request_for_proposal.budget = -1
      expect(request_for_proposal).not_to be_valid
      expect(request_for_proposal.errors).to have_key(:budget)
    end

    it 'should allow a budget to be 0' do
      request_for_proposal.budget = 0
      expect(request_for_proposal).to be_valid
    end    
  end

  describe 'state' do
    let(:request_for_proposal) { build(:request_for_proposal) }

    shared_examples_for 'a state change' do
      it 'should change state' do
        event
        expect(request_for_proposal.state).to eq(state)
      end
    end

    describe 'begin fulfillment' do
      let(:state) { 'pending_fulfillment' }
      let(:event) { request_for_proposal.begin_fulfillment }

      it_behaves_like 'a state change'
    end

    describe 'fulfill' do
      let(:state) { 'fulfilled' }
      let(:event) { request_for_proposal.fulfill }

      before do
        request_for_proposal.state = 'pending_fulfillment'
      end

      it_behaves_like 'a state change'
    end
  end

  describe "#notify_admins_and_developers" do
    it "should call send_email for all team members with correct template" do
      developer = double('developer')
      request_for_proposal.stub(team: double(admins_and_developers: [developer]))
      developer.should_receive(:send_email).with(:member_accepted_proposal)
      request_for_proposal.notify_admins_and_developers
    end
  end

  describe '#pending_proposals' do
    it 'should get the pending proposals for an issue' do
      proposals = double(:proposal)
      proposals.stub(:pending)
      request_for_proposal.stub(proposals: proposals)
      expect(proposals).to receive(:pending)
      request_for_proposal.pending_proposals
    end
  end
end
