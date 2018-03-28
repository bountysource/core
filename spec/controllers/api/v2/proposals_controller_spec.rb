require 'spec_helper'

describe Api::V2::ProposalsController do
  include_context 'api v2 controller'

  let(:request_for_proposal) { double(:request_for_proposal) }
  let(:issue) { double(:issue, id: 1) }
  let(:person) { double(:person) }
  let(:team) { build(:team, rfp_enabled: true) }
  let(:proposal) { double(:proposal, id: 1) }
  let(:ar_proposal) { build_stubbed(:proposal) }

  before do
    allow_any_instance_of(Api::BaseController).to receive(:current_user).and_return(person)
    allow(Issue).to receive(:find_by!).and_return(issue)
    allow(issue).to receive(:request_for_proposal).and_return(request_for_proposal)
    allow(issue).to receive(:team).and_return(team)
    allow(team).to receive(:person_is_admin?).and_return(true)
    allow(team).to receive(:person_is_developer?).and_return(true)
    allow(proposal).to receive(:person).and_return(person)
    allow(proposal).to receive_messages(destroyable?: true)
    allow(request_for_proposal).to receive_message_chain(:proposals, :find_by!).and_return(proposal)

    params.merge!(issue_id: issue.id, id: proposal.id)
  end

  shared_examples_for 'a request that requires a proposal' do
    it 'should require proposal' do
      allow(request_for_proposal).to receive_message_chain(:proposals, :find_by!).and_raise(ActiveRecord::RecordNotFound)
      action
      expect(response.status).to eq(404)
    end
  end

  describe 'create' do
    describe 'authorization' do
      let(:action) { post(:create, params: params) }
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request that requires a request for proposal'
      it_behaves_like 'a request that converts currency'
    end

    it 'should create proposal' do
      allow(request_for_proposal).to receive_message_chain(:proposals, :create!).and_return(proposal)
      post(:create, params: params)
      expect(response.status).to eq(201)
    end

    it 'should not create a proposal if the RFP is pending_fullfillment' do
      allow(request_for_proposal).to receive_message_chain(:proposals, :create!).and_raise(ActiveRecord::RecordInvalid.new(ar_proposal))
      post(:create, params: params)
      expect(response.status).to eq(422)
    end
  end

  describe 'destroy' do
    describe 'authorization' do
      let(:action) { delete(:destroy, params: params) }
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request that requires a request for proposal'
      it_behaves_like 'a request that requires a proposal'
      it_behaves_like 'a request authorized by require_proposal_owner'
    end

    it 'should not destroy if the proposal cannot be destroyed' do
      # Needed an ActiveRecord object to save me from stub hell
      allow(request_for_proposal).to receive_message_chain(:proposals, :find_by!).and_return(ar_proposal)
      allow(ar_proposal).to receive(:destroy!).and_raise(ActiveRecord::RecordInvalid.new(ar_proposal))
      allow(ar_proposal).to receive(:person).and_return(person)

      delete(:destroy, params: params)
      expect(response.status).to eq(422)
    end

    it 'should destroy proposal' do
      expect(proposal).to receive(:destroy!).once
      delete(:destroy, params: params)
      expect(response.status).to eq(204)
    end
  end

  describe 'index' do
    describe 'authorization' do
      let(:action) { get(:index, params: params) }
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request that requires a request for proposal'
      it_behaves_like 'a request authorized by require_team_admin_or_developer'
    end

    it 'should render proposals' do
      expect(request_for_proposal).to receive(:proposals).once
      get(:index, params: params)
      expect(response.status).to eq(200)
    end
  end

  shared_examples_for 'a request that saves notes to proposal' do
    let(:notes) { 'I love you, corytheboyd <3' }

    before do
      params.merge!(team_notes: notes)
    end

    it 'should set team notes' do
      expect(proposal).to receive(:set_team_notes!).with(notes).once
      action
      expect(response.status).to eq(200)
    end

    it 'should render error on failed update of team notes' do
      expect(proposal).to receive(:set_team_notes!).and_raise(ActiveRecord::RecordInvalid.new(Proposal.new)).once
      action
      expect(response.status).to eq(422)
    end
  end

  describe 'accept' do
    let(:action) { post(:accept, params: params) }

    before do
      allow(proposal).to receive(:begin_appointment!)
      allow(proposal).to receive(:set_team_notes!)
    end

    describe 'authorization' do
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request that requires a request for proposal'
      it_behaves_like 'a request that requires a proposal'
      it_behaves_like 'a request authorized by require_team_admin_or_developer'
    end

    it_behaves_like 'a request that saves notes to proposal'

    it 'should accept proposal' do
      expect(proposal).to receive(:begin_appointment!).once
      action
      expect(response.status).to eq(200)
    end

    it 'should render bad request on invalid state change' do
      expect(proposal).to receive(:begin_appointment!).and_raise(AASM::InvalidTransition)
      action
      expect(response.status).to eq(400)
    end

    it 'should set team notes' do
      notes = 'You are a god among men, just like corytheboyd <3'
      expect(proposal).to receive(:set_team_notes!).with(notes).once
      post(:accept, params: params.merge(team_notes: notes))
      expect(response.status).to eq(200)
    end
  end

  describe 'reject' do
    let(:action) { post(:reject, params: params) }

    before do
      allow(proposal).to receive(:reject!)
      allow(proposal).to receive(:set_team_notes!)
    end

    describe 'authorization' do
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request that requires a request for proposal'
      it_behaves_like 'a request that requires a proposal'
      it_behaves_like 'a request authorized by require_team_admin_or_developer'
    end

    it_behaves_like 'a request that saves notes to proposal'

    it 'should reject proposal' do
      expect(proposal).to receive(:reject!).once
      action
      expect(response.status).to eq(200)
    end

    it 'should render bad request on invalid state change' do
      expect(proposal).to receive(:reject!).and_raise(AASM::InvalidTransition)
      action
      expect(response.status).to eq(400)
    end
  end

  describe 'show' do
    let(:proposal_id) { 1 }

    describe 'authorization' do
      let(:action) { post(:reject, params: params) }
      it_behaves_like 'a request that requires auth'
    end

    before do
      # Person not on team
      allow(team).to receive(:person_is_admin?).and_return(false)
      allow(team).to receive(:person_is_developer?).and_return(false)
    end

    it 'should render current users proposal' do
      expect(request_for_proposal.proposals).to receive(:find_by!).with(person: person).once
      get(:show, params: params.merge(id: 'mine'))
      expect(response.status).to eq(200)
    end

    it 'should not render proposal that does not belong to current user' do
      get(:show, params: params.merge(id: proposal_id))
      expect(response.status).to eq(401)
    end
  end
end
