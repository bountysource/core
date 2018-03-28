# == Schema Information
#
# Table name: proposals
#
#  id                      :integer          not null, primary key
#  request_for_proposal_id :integer          not null
#  person_id               :integer          not null
#  amount                  :decimal(10, 2)   not null
#  estimated_work          :integer
#  bio                     :string(1000)
#  state                   :string(255)      default("pending")
#  created_at              :datetime
#  updated_at              :datetime
#  completed_by            :datetime
#  team_notes              :text
#
# Indexes
#
#  index_proposals_on_amount                                 (amount)
#  index_proposals_on_person_id                              (person_id)
#  index_proposals_on_person_id_and_request_for_proposal_id  (person_id,request_for_proposal_id) UNIQUE
#  index_proposals_on_request_for_proposal_id                (request_for_proposal_id)
#

require 'spec_helper'

describe Proposal do
  let(:rfp) { build_stubbed(:request_for_proposal) }
  let(:proposal) { build_stubbed(:proposal, request_for_proposal: rfp) }

  describe 'validations' do
    before(:each) do
      @proposal = Proposal.new()
    end

    it "should require a request_for_proposal_id" do
      @proposal.request_for_proposal = nil
      @proposal.amount = 5
      @proposal.valid?
      expect(@proposal.errors).to have_key(:request_for_proposal)
    end

    it "should require a person_id" do
      allow(@proposal).to receive_messages(request_for_proposal: rfp)
      @proposal.amount = 6
      @proposal.request_for_proposal_id = 2
      @proposal.valid?
      expect(@proposal.errors).to have_key(:person)
    end

    it "should require the amount attribute be greater than or equal to 0" do
      @proposal.amount = -1
      allow(@proposal).to receive_messages(request_for_proposal: rfp)
      @proposal.person_id = 1
      @proposal.valid?
      expect(@proposal.errors).to have_key(:amount)
    end

    it "should not bio abstracts greater than 1000 characters" do
      @proposal.bio = "1" * 1001
      @proposal.amount = 30
      allow(@proposal).to receive_messages(request_for_proposal: rfp)
      @proposal.person_id = 1
      @proposal.valid?
      expect(@proposal.errors).to have_key(:bio)
    end

    it 'should check that a proposal can be destroyed when calling destroy' do
      expect(@proposal).to receive(:destroyable?).and_return(true)
      @proposal.destroy!
    end
  end

  describe '#able_to_create' do
    let(:proposal) { build(:proposal) }

    it "should return true if the request_for_proposal is accepting proposals" do
      allow(proposal).to receive(:send_submitted_email_to_team)
      proposal.request_for_proposal.state = 'pending'
      proposal.valid?
      expect(proposal.errors.count).to eq(0)
    end

    it 'should return false if the request_for_proposal is not accepting proposals' do
      proposal.request_for_proposal.state = 'pending_fulfillment'
      proposal.valid?
      expect(proposal.errors).to have_key(:request_for_proposal)
    end
  end

  describe 'create' do
    let(:proposal) { build(:proposal) }

    it 'should send submitted email to team' do
      expect(proposal).to receive(:send_submitted_email_to_team).once
      proposal.save
    end
  end

  describe 'team emails' do
    shared_examples_for 'an email blast to the team' do
      let(:proposal) { build(:proposal) }
      let(:request_for_proposal) { double(:request_for_proposal) }
      let(:team) { double(:team) }
      let(:admin_member) { double(:team_member) }
      let(:developer_member) { double(:developer_member) }
      let(:plebian_member) { double(:plebian_member) }

      before do
        allow(proposal).to receive(:request_for_proposal).and_return(request_for_proposal)
        allow(request_for_proposal).to receive(:team).and_return(team)

        allow(team).to receive(:admins).and_return([admin_member])
        allow(team).to receive(:developers).and_return([developer_member])
        allow(team).to receive(:plebs).and_return([plebian_member])

        allow(admin_member).to receive(:send_email)
        allow(developer_member).to receive(:send_email)
        allow(plebian_member).to receive(:send_email)
      end

      it 'should email team admins and developers' do
        expect(admin_member).to receive(:send_email).with(template, proposal: proposal).once
        expect(developer_member).to receive(:send_email).with(template, proposal: proposal).once
        proposal.send(method)
      end

      it 'should not email members that are neither admin nor developer' do
        expect(plebian_member).to receive(:send_email).never
        proposal.send(method)
      end
    end

    describe 'send_submitted_email_to_team' do
      let(:method) { :send_submitted_email_to_team }
      let(:template) { :proposal_created_to_team }
      it_behaves_like 'an email blast to the team'
    end

    # TODO enable these again when solving https://github.com/bountysource/frontend/issues/829
    # describe 'send_appointed_email_to_team' do
    #   let(:method) { :send_appointed_email_to_team }
    #   let(:template) { :proposal_appointed_to_team }
    #   it_behaves_like 'an email blast to the team'
    # end
    #
    # describe 'send_rejected_email_to_team' do
    #   let(:method) { :send_rejection_email_to_team }
    #   let(:template) { :proposal_rejected_to_team }
    #   it_behaves_like 'an email blast to the team'
    # end
  end

  describe 'state' do
    let(:request_for_proposal) { build(:request_for_proposal) }
    let(:proposal) { build(:proposal, request_for_proposal: request_for_proposal) }

    before do
      allow(proposal).to receive(:send_appointed_email)
      allow(proposal).to receive(:send_approval_email)
      allow(proposal).to receive(:send_rejection_email)
      allow(proposal).to receive(:reject_other_pending_proposals!)
      allow(proposal).to receive(:begin_fulfillment_of_request_for_proposal!)
      allow(proposal).to receive(:fulfill_request_for_proposal!)
      allow(proposal).to receive(:reverse_fulfillment_of_request_for_proposal!)
      allow(proposal).to receive(:reset_team_notes!)
    end

    it 'should be pending by default' do
      expect(proposal.state).to eq('pending')
    end

    describe 'events' do
      shared_examples_for 'a state change' do
        it 'should change state' do
          event
          expect(proposal.state).to eq(state)
        end
      end

      describe 'begin appointment' do
        let(:state) { 'pending_appointment' }
        let(:event) { proposal.begin_appointment }

        it_behaves_like 'a state change'

        it 'should change state of request for proposal to pending fulfillment' do
          expect(proposal).to receive(:begin_fulfillment_of_request_for_proposal!).once
          event
        end
      end

      describe 'reject' do
        let(:state) { 'rejected' }
        let(:event) { proposal.reject }

        it_behaves_like 'a state change'

        it 'should send rejection email to developer' do
          expect(proposal).to receive(:send_rejection_email).once
          event
        end

        # TODO enable these again when solving https://github.com/bountysource/frontend/issues/829
        # it 'should send rejected email to team members' do
        #   expect(proposal).to receive(:send_rejection_email_to_team).once
        #   event
        # end
      end

      describe 'revert appointment' do
        let(:state) { 'pending' }
        let(:event) { proposal.reverse_appointment }

        before do
          proposal.state = 'pending_appointment'
        end

        it_behaves_like 'a state change'

        it 'should reverse fulfillment of request for proposal' do
          expect(proposal).to receive(:reverse_fulfillment_of_request_for_proposal!).once
          event
        end

        it 'should reset team notes' do
          expect(proposal).to receive(:reset_team_notes!).once
          event
        end
      end

      describe 'appoint' do
        let(:state) { 'appointed' }
        let(:event) { proposal.appoint }

        before do
          proposal.state = 'pending_appointment'
        end

        it_behaves_like 'a state change'

        it 'should send appointed email to proposal owner' do
          expect(proposal).to receive(:send_appointed_email).once
          event
        end

        # TODO enable these again when solving https://github.com/bountysource/frontend/issues/829
        # it 'should send appointed email to other team members' do
        #   expect(proposal).to receive(:send_appointed_email_to_team).once
        #   event
        # end
      end

      describe 'begin approval' do
        let(:state) { 'pending_approval' }
        let(:event) { proposal.begin_approval }

        before do
          proposal.state = 'appointed'
        end

        it_behaves_like 'a state change'
      end

      describe 'approve' do
        let(:state) { 'approved' }
        let(:event) { proposal.approve }

        before do
          proposal.state = 'pending_approval'
        end

        it_behaves_like 'a state change'

        it 'should change state of request for proposal to fulfilled' do
          expect(proposal).to receive(:fulfill_request_for_proposal!).once
          event
        end

        it 'should reject all other pending proposals' do
          expect(proposal).to receive(:reject_other_pending_proposals!).once
          event
        end

        it 'should send approval email to developer' do
          expect(proposal).to receive(:send_approval_email).once
          event
        end
      end

      describe 'send_appointed_email' do
        let(:person) { double(:person) }

        before do
          allow(proposal).to receive(:send_appointed_email).and_call_original
          allow(proposal).to receive(:person).and_return(person)
        end

        it 'should send email' do
          expect(person).to receive(:send_email).with(:proposal_appointed, proposal: proposal)
          proposal.send(:send_appointed_email)
        end
      end

      describe 'send_rejection_email' do
        let(:person) { double(:person) }

        before do
          allow(proposal).to receive(:send_rejection_email).and_call_original
          allow(proposal).to receive(:person).and_return(person)
        end

        it 'should send email' do
          expect(person).to receive(:send_email).with(:proposal_rejected, proposal: proposal)
          proposal.send(:send_rejection_email)
        end
      end

      describe 'reject_other_pending_proposals!' do
        let(:other_proposal) { double(:other_proposal) }

        before do
          allow(proposal).to receive(:reject_other_pending_proposals!).and_call_original
          allow(proposal).to receive_message_chain(:other_proposals, :pending).and_return([other_proposal])
        end

        it 'should reject other proposals' do
          expect(other_proposal).to receive(:reject!).once
          proposal.send(:reject_other_pending_proposals!)
        end

        it 'should not reject this proposal' do
          expect(proposal).not_to receive(:reject!)
        end
      end

      describe 'begin_fulfillment_of_request_for_proposal!' do
        before do
          allow(proposal).to receive(:begin_fulfillment_of_request_for_proposal!).and_call_original
        end

        it 'should change state of request for proposal to pending fulfillment' do
          expect(request_for_proposal).to receive(:begin_fulfillment!).once
          proposal.send(:begin_fulfillment_of_request_for_proposal!)
        end
      end

      describe 'fulfill_request_for_proposal!' do
        before do
          allow(proposal).to receive(:fulfill_request_for_proposal!).and_call_original
        end

        it 'should change state of request for proposal to fulfilled' do
          expect(request_for_proposal).to receive(:fulfill!).once
          proposal.send(:fulfill_request_for_proposal!)
        end
      end

      describe 'reset_team_notes!' do
        before do
          allow(proposal).to receive(:reset_team_notes!).and_call_original
        end

        it 'should set team notes to nil' do
          expect(proposal).to receive(:set_team_notes!).with(nil).once
          proposal.send(:reset_team_notes!)
        end
      end
    end
  end

  describe '#after_purchase' do
    it "should call accept and send out notification emails" do
      person = double('person')
      allow(rfp).to receive_messages(notify_admins_and_developers: true)
      allow(proposal).to receive_messages(person: person)

      expect(proposal).to receive(:appoint!).once
      expect(rfp).to receive(:notify_admins_and_developers).once

      proposal.after_purchase(double('order'))
    end
  end

  describe '#managing_team' do
    let(:proposal) { build_stubbed(:proposal) }
    let(:team) { build_stubbed(:team) }

    it "should return the team that owns the issue's tracker" do
      issue = double("issue", team: team)
      allow(proposal).to receive_messages(issue: issue)
      expect(proposal.managing_team).to eq(team)
    end
  end

  describe 'account' do
    let(:account) { double(:account) }
    let(:request_for_proposal) { double(:request_for_proposal) }
    let(:proposal) { build(:proposal) }

    before do
      allow(proposal).to receive(:request_for_proposal).and_return(request_for_proposal)
      allow(request_for_proposal).to receive(:account).and_return(account)
    end

    it 'should delegate account to request for proposal' do
      expect(request_for_proposal).to receive(:account).once
      expect(proposal.account).to eq(account)
    end
  end

  describe '#destroyable?' do
    let(:destroyable?) { proposal.send(:destroyable?) }

    it 'should return true if the proposal can be destroyed' do
      expect(destroyable?).to be true
    end

    it 'should return false is the proposal cannot be destroyed' do
      proposal.state = 'accepted'
      expect(destroyable?).to be false
    end

    it 'should be destroyable if state is rejected' do
      proposal.state = 'rejected'
      expect(destroyable?).to be true
    end
  end

  describe 'set_team_notes!' do
    let(:proposal) { build(:proposal) }
    let(:notes) { 'You are a god among men, just like corytheboyd <3' }

    it 'should update with team notes' do
      expect(proposal).to receive(:update_attributes!).with(team_notes: notes).once
      proposal.set_team_notes!(notes)
    end
  end
end
