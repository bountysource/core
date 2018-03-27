require 'spec_helper'

describe Api::V1::PledgesController do
  render_views

  let(:person) { create(:person) }
  let(:params) do
    {
      access_token: person.create_access_token
    }
  end

  describe "require_pledge" do
    it "should return Pledge not found" do
      expect {
        get 'show', params: params
      }.to raise_error(ActionController::UrlGenerationError)
    end
  end

  describe 'update survey response' do
    let(:fundraiser) { create(:fundraiser) }
    let(:reward) { create(:reward, fundraiser: fundraiser, amount: 50) }
    let(:pledge) { create(:pledge, fundraiser: fundraiser, reward: reward, person: person, amount: 90) }

    before do
      post :update, params: params.merge(id: pledge.id, survey_response: "Ship it to the moon")
      @response_data = JSON.parse(response.body).with_indifferent_access
    end

    it "should assigns pledge" do
      assigns[:pledge].id.should == pledge.id # survey response changed
    end

    it "should update pledge survey response" do
      assigns[:pledge].survey_response.should == "Ship it to the moon"
    end
  end
end
