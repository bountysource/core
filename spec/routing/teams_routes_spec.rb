require 'spec_helper'

describe 'routes for v2 teams controller' do
  # no request object available. Mock out Accept headers on HTTP request
  before { Rack::MockRequest::DEFAULT_ENV["HTTP_ACCEPT"] = "application/vnd.bountysource+json; version=2" }
  let(:api_host) { Api::Application.config.api_url }
  let(:team_id) { "1" }

  it 'should route to show action' do
    expect(get: "#{api_host}teams/#{team_id}").
      to route_to(action: 'show', vendor_string: 'bountysource', controller: 'api/v2/teams', id: team_id)
  end

  it 'should route to index action' do
    expect(get: "#{api_host}teams").
      to route_to(action: 'index', vendor_string: 'bountysource', controller: 'api/v2/teams')
  end
end