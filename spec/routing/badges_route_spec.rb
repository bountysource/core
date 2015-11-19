require 'spec_helper'

describe 'routing for badges' do
  let(:api_host) { Api::Application.config.api_url }

  describe 'issue' do
    let(:issue_id) { '1' }
    let(:params) { { issue_id: issue_id } }

    it 'routes to issue' do
      expect(get: "#{api_host}badge/issue?#{params.to_param}").to route_to(controller: 'badge', action: 'issue', issue_id: issue_id)
    end
  end

  describe 'tracker' do
    let(:tracker_id) { '1' }
    let(:params) { { tracker_id: tracker_id } }

    it 'routes to tracker' do
      expect(get: "#{api_host}badge/tracker?#{params.to_param}").to route_to(controller: 'badge', action: 'tracker', tracker_id: tracker_id)
    end
  end

  describe 'team' do
    let(:team_id) { '1' }
    let(:params) { { team_id: team_id } }

    shared_examples_for 'a team route' do
      before { params.merge!(type: type) }
      it 'routes to team' do
        expect(get: "#{api_host}badge/team?#{params.to_param}").to route_to(controller: 'badge', action: 'team', team_id: team_id, type: type)
      end
    end

    describe 'bounties posted' do
      let(:type) { 'bounties_posted' }
      it_behaves_like 'a team route'
    end

    describe 'bounties received' do
      let(:type) { 'bounties_received' }
      it_behaves_like 'a team route'
    end

    describe 'money raised' do
      let(:type) { 'raised' }
      it_behaves_like 'a team route'
    end
  end
end