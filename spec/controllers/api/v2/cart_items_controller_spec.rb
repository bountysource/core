require 'spec_helper'

describe Api::V2::CartItemsController do
  let(:person) { create(:person) }
  let(:unauth_person) { create(:person) }
  let(:cart) { person.shopping_cart }
  let(:team) { create(:team) }
  let!(:team_member_relation) { create(:team_member_relation, person: person, team: team, developer: true, owner: person)}
  let(:tracker) { create(:tracker, team: team)}
  let(:issue) { create(:issue, tracker: tracker) }
  let(:rfp) { create(:request_for_proposal, issue: issue) }
  let!(:proposal) { create(:proposal, request_for_proposal: rfp) }

  let(:params) do
    {
      access_token: person.create_access_token,
      vendor_string: 'bountysource',
      id: 0, #index of item in cart.items
      proposal_id: proposal.id,
      uid: cart.uid,
      item_type: 'proposal',
      amount: 1000,
      currency: 'USD',
      request_for_proposal_id: rfp.id
    }
  end

  describe '#create' do
    # i.e. Person isn't part of the team that manages the issue on which there is an RFP (Proposal belongs to RFP!)
    it 'should raise if person doesnt have authorization to add Proposal to their cart' do
      params[:access_token] = unauth_person.create_access_token
      params[:uid] = unauth_person.shopping_cart.uid
      post(:create, params: params)
      response.status.should eq(401)
    end

    it 'should return 200 person has authorization to add Proposal to their cart' do
      post(:create, params: params)
      response.status.should eq(200)
    end
  end

  describe '#update' do
    before { cart.add_item proposal.attributes.merge!({item_type: 'proposal', currency: 'USD', proposal_id: proposal.id}) }
    it 'should raise if ANY person attempts to update Proposal to their cart' do
      put(:update, params: params)
      response.status.should eq(401)
    end
  end
end
