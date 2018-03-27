require 'spec_helper'

describe Api::V1::BountyClaimResponsesController do

  let(:person) { create(:person) }
  let(:issue) { create(:issue, can_add_bounty: false) }
  let!(:bounty) { create_bounty(1337, person: person, issue: issue) }
  let(:developer) { create(:person) }
  let!(:bounty_claim) { create(:bounty_claim, issue: issue, person: developer) }

  let(:response_data) { JSON.parse(response.body) }

  let(:params) do
    {
      access_token: person.create_access_token,
      id: bounty_claim.id
    }
  end

  it "should respond with accept" do
    expect {
      put :accept, params: params
      assert_response :ok
    }.to change(person.bounty_claim_responses, :count).by 1

    person.bounty_claim_responses.last.should be_accept
  end

  it "should require description to reject" do
    expect {
      delete :reject, params: params
      assert_response :unprocessable_entity
    }.not_to change(person.bounty_claim_responses, :count)
  end

  it "should respond with reject" do
    expect {
      delete :reject, params: params.merge(description: "your code sux")
      assert_response :ok
    }.to change(person.bounty_claim_responses, :count).by 1

    person.bounty_claim_responses.last.should be_reject
  end

  it "should require auth to accept" do
    params.delete(:access_token)
    put :accept, params: params
    assert_response :unauthorized
  end

  it "should require auth to reject" do
    params.delete(:access_token)
    delete :reject, params: params
    assert_response :unauthorized
  end

  it "should require person to place a bounty to respond" do
    expect {
      rebel_scum = create(:person)
      delete :reject, params: params.merge(access_token: rebel_scum.create_access_token, description: "meep moop")
      assert_response :bad_request
    }.not_to change(bounty_claim.bounty_claim_responses, :count)
  end

end
