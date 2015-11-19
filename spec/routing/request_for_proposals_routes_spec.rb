require 'spec_helper'

describe 'routes for RequestForProposals' do
  # no request object available. Mock out Accept headers on HTTP request
  before { Rack::MockRequest::DEFAULT_ENV["HTTP_ACCEPT"] = "application/vnd.bountysource+json; version=2" }
  let(:api_host) { Api::Application.config.api_url }

  let(:issue_id) { '1' }

  it "should route to show" do
    expect(get: "#{api_host}issues/#{issue_id}/request_for_proposals").
      to route_to(action: 'show', vendor_string: 'bountysource', controller: 'api/v2/request_for_proposals', issue_id: issue_id)
  end

  it "should route to create" do
    expect(post: "#{api_host}issues/#{issue_id}/request_for_proposals").
      to route_to(action: 'create', vendor_string: 'bountysource', controller: 'api/v2/request_for_proposals', issue_id: issue_id)
  end

  it "should route to update" do
    expect(patch: "#{api_host}issues/#{issue_id}/request_for_proposals").
      to route_to(action: 'update', vendor_string: 'bountysource', controller: 'api/v2/request_for_proposals', issue_id: issue_id)
  end

  it "should route to destroy" do
    expect(delete: "#{api_host}issues/#{issue_id}/request_for_proposals").
      to route_to(action: 'destroy', vendor_string: 'bountysource', controller: 'api/v2/request_for_proposals', issue_id: issue_id)
  end

end
