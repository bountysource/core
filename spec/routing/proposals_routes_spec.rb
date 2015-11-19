require 'spec_helper'

describe 'routes for Proposals' do
  # TODO move this into a shared_context for v2 routing specs
  # no request object available. Mock out Accept headers on HTTP request
  before { Rack::MockRequest::DEFAULT_ENV["HTTP_ACCEPT"] = "application/vnd.bountysource+json; version=2" }
  let(:api_host) { Api::Application.config.api_url }

  let(:issue_id) { "1" }
  let(:proposal_id) { "1" }

  it "should route to create" do
    expect(post: "#{api_host}issues/#{issue_id}/proposals").
      to route_to(action: 'create', vendor_string: 'bountysource', controller: 'api/v2/proposals', issue_id: issue_id)
  end

  it "should route to index" do
    expect(get: "#{api_host}issues/#{issue_id}/proposals").
      to route_to(action: 'index', vendor_string: 'bountysource', controller: 'api/v2/proposals', issue_id: issue_id)
  end

  it "should route to destroy" do
    expect(delete: "#{api_host}issues/#{issue_id}/proposals/#{proposal_id}").
      to route_to(action: 'destroy', vendor_string: 'bountysource', controller: 'api/v2/proposals', issue_id: issue_id, id: proposal_id)
  end

  it "should route to accept" do
    expect(post: "#{api_host}issues/#{issue_id}/proposals/#{proposal_id}/accept").
      to route_to(action: 'accept', vendor_string: 'bountysource', controller: 'api/v2/proposals', issue_id: issue_id, id: proposal_id)
  end

  it "should route to reject" do
    expect(post: "#{api_host}issues/#{issue_id}/proposals/#{proposal_id}/reject").
      to route_to(action: 'reject', vendor_string: 'bountysource', controller: 'api/v2/proposals', issue_id: issue_id, id: proposal_id)
  end
end
