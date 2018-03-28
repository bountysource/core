require 'spec_helper'

describe Api::V2::RequestForProposalsController do
  include_context 'api v2 controller'

  let(:request_for_proposal) { double(:request_for_proposal) }
  let(:issue) { double(:issue, id: 1) }
  let(:team) { build(:team, rfp_enabled: true) }
  let(:person) { double(:person) }

  before do
    allow_any_instance_of(Api::BaseController).to receive(:current_user).and_return(person)
    allow(Issue).to receive(:find_by!).and_return(issue)
    allow(issue).to receive(:team).and_return(team)
    allow(issue).to receive(:request_for_proposal).and_return(request_for_proposal)
    allow(team).to receive(:person_is_admin?).and_return(true)
    allow(team).to receive(:person_is_developer?).and_return(true)

    params.merge!(issue_id: issue.id)
  end

  describe 'show' do
    describe 'authorization' do
      let(:action) { get(:show, params: params) }
      it_behaves_like 'a request that requires a request for proposal'
    end

    it 'should render request for proposal' do
      get(:show, params: params)
      expect(response.status).to eq(200)
    end

    it 'should require issue' do
      allow(Issue).to receive(:find_by!).and_raise(ActiveRecord::RecordNotFound)
      get(:show, params: params)
      expect(response.status).to eq(404)
    end

    it 'should require request for proposal' do
      allow(issue).to receive(:request_for_proposal).and_return(nil)
      expect(issue).to receive(:request_for_proposal).once

      get(:show, params: params)
      expect(response.status).to eq(404)
    end
  end

  describe 'create' do
    describe 'authorization' do
      let(:action) { post(:create, params: params) }
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request authorized by require_team_admin_or_developer'
      it_behaves_like 'a request that converts currency'
    end

    it 'should create' do
      expect(issue).to receive(:create_request_for_proposal!).once
      post(:create, params: params)
      expect(response.status).to eq(201)
    end
  end

  describe 'update' do
    describe 'authorization' do
      let(:action) { patch(:update, params: params) }
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request that requires a request for proposal'
      it_behaves_like 'a request authorized by require_team_admin_or_developer'
    end

    before { allow(request_for_proposal).to receive(:save!) }

    it 'should update budget' do
      budget = "123456789"
      expect(request_for_proposal).to receive(:budget=).with(budget)

      patch(:update, params: params.merge(budget: budget))
      expect(response.status).to eq(200)
    end

    it 'should update due date' do
      due_date = "2014-06-05T10:34:14-07:00"
      expect(request_for_proposal).to receive(:due_date=).with(due_date)

      patch(:update, params: params.merge(due_date: due_date))
      expect(response.status).to eq(200)
    end

    it 'should update notes' do
      abstract = "I am the greatest man that every lived"
      expect(request_for_proposal).to receive(:abstract=).with(abstract)

      patch(:update, params: params.merge(abstract: abstract))
      expect(response.status).to eq(200)
    end

    it 'should update' do
      expect(request_for_proposal).to receive(:save!).once
      patch(:update, params: params)
      expect(response.status).to eq(200)
    end
  end

  describe 'destroy' do
    describe 'authorization' do
      let(:action) { delete(:destroy, params: params) }
      it_behaves_like 'a request that requires auth'
      it_behaves_like 'a request that requires a request for proposal'
      it_behaves_like 'a request authorized by require_team_admin_or_developer'
    end

    it 'should destroy request for proposal' do
      expect(request_for_proposal).to receive(:destroy!).once
      delete(:destroy, params: params)
      expect(response.status).to eq(204)
    end
  end
end
