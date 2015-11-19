require 'spec_helper'

describe Api::V1::BountyClaimsController do
  render_views

  let(:person) { create(:person) }
  let(:issue) { create(:issue, can_add_bounty: false) }

  let(:response_data) { JSON.parse(response.body) }

  let(:params) do
    {
      access_token: person.create_access_token,
      code_url: "https://github.com/bountysource/frontend/pulls/1",
      description: "Lorem ipsum stack",
      issue_id: issue.id
    }
  end

  it "should create bounty claim" do
    expect {
      post :create, params
      assert_response :created
    }.to change(person.bounty_claims, :count).by 1
  end

  it "should log when a bounty claim is created" do
    expect {
      post :create, params
    }.to change(ActivityLog, :count).by 1
  end

  it "should require auth to create" do
    params.delete(:access_token)
    expect {
      post :create, params
      assert_response :unauthorized
    }.not_to change(person.bounty_claims, :count)
 end

  it "should not require code_url to create" do
    params.delete(:code_url)
    expect {
      post :create, params
      assert_response :created
    }.to change(person.bounty_claims, :count).by 1
  end

  it "should not require description to create" do
    params.delete(:description)
    expect {
      post :create, params
      assert_response :created
    }.to change(person.bounty_claims, :count).by 1
  end

  it "should require code_url and/or description to create" do
    params.delete(:code_url)
    params.delete(:description)
    expect {
      post :create, params
      assert_response :unprocessable_entity
    }.not_to change(person.bounty_claims, :count)
  end

  it "should require issue to create" do
    params.delete(:issue_id)
    expect {
      post :create, params
      assert_response :not_found
    }.not_to change(person.bounty_claims, :count)
  end

  describe "with bounty_claim" do
    let!(:bounty_claim) { create(:bounty_claim, person: person, issue: issue) }

    let(:params) do
      {
        access_token: person.create_access_token,
        id: bounty_claim.id
      }
    end

    it "should update code_url" do
      new_code_url = "https://disney.com/"
      expect {
        put :update, params.merge(code_url: new_code_url)
        bounty_claim.reload
      }.to change(bounty_claim, :code_url).to new_code_url
    end

    it "should update description" do
      description = "Beem meep! I fixed it, and deserve the bounty!"
      expect {
        put :update, params.merge(description: description)
        bounty_claim.reload
      }.to change(bounty_claim, :description).to description
    end

    it "should not update the issue" do
      expect {
        put :update, params.merge(issue_id: issue.id + 1)
        bounty_claim.reload
      }.not_to change(bounty_claim, :issue_id)
    end

    it "should have person on index" do
      get :index, params
      response_data.first.should have_key "person"
    end

    it "should have person on show" do
      get :show, params
      response_data.should have_key "person"
    end
  end
end
