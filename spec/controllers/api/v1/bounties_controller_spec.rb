require 'spec_helper'

describe Api::V1::BountiesController do
  let!(:fundraiser_owner) { create(:person) }
  let!(:fundraiser) { create(:fundraiser, person_id: fundraiser_owner.id) }
  let!(:params) { { access_token: fundraiser_owner.create_access_token, fundraiser_id: fundraiser.to_param } }

  describe '#index' do
    it "should be successful" do
      get 'index', params
      assert_response :ok
    end
  end

  describe "require_bounty" do
    it "should return Bounty not found" do
      expect {
        get 'show', params
      }.to raise_error(ActionController::UrlGenerationError)
    end
  end
end
