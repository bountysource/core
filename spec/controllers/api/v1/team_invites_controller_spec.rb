require 'spec_helper'

describe Api::V1::TeamInvitesController do
  render_views

  let(:person) { create(:person) }
  let(:team) { create(:team) }
  let!(:invite) { create(:team_invite, team: team) }
  let(:response_data) { JSON.parse(response.body) }
  let(:params) do
    {
      access_token: person.create_access_token,
      id: team.to_param,
      token: invite.token
    }
  end

  it "should require auth" do
    post :accept, params.merge(access_token: nil)
    assert_response :unauthorized
  end

  it "should require token" do
    post :accept, params.merge(token: nil)
    assert_response :forbidden
  end

  it "should require valid token" do
    post :accept, params.merge(token: "not a valid token hahahahahahaahahhahahhahahhahhahah")
    assert_response :forbidden
  end

  it "should add person to team" do
    expect {
      post :accept, params
      assert_response :ok
    }.to change(team.members, :count).by 1
  end

  it "should delete the invite after consumption" do
    expect {
      post :accept, params
      assert_response :ok
    }.to change(TeamInvite, :count).by -1
  end

  it "should not create duplicate team invites" do
    relation = double(:admin? => true)
    team.stub(:relation_for_owner).and_return(relation)
    Team.stub(:find_by).and_return(team)

    dup_params = {
      access_token: person.create_access_token,
      id: team.to_param, 
      admin: true,
      developer: true,
      public: false,
      email: "robert.paulson@gmail.com"
    }
    expect {
      post :create, dup_params
      assert_response :unprocessable_entity
    }.not_to change(TeamInvite, :count)
  end

  describe "only admins can add people" do
    it "should fail if the requester is not an admin" do
      relation = double(:admin? => false)
      team.stub(:relation_for_owner).and_return(relation)
      Team.stub(:find_by).and_return(team)

      expect {
        post :create, params
        assert_response :unauthorized
      }.not_to change(TeamInvite, :count)
    end

    it "should be successful for admins" do
      relation = double(:admin? => true)
      team.stub(:relation_for_owner).and_return(relation)
      Team.stub(:find_by).and_return(team)

      TeamInvite.any_instance.stub_chain(:delay, :send_email).and_return(true)

      expect {
        post :create, params
        assert_response :success
      }.to change(TeamInvite, :count)
    end
  end

  context "custom permissions" do
    let(:invite) { create(:team_invite, team: team, admin: true, developer: true, public: false) }

    it "should add person to team with permissions" do
      post :accept, params
      team.reload
      relation = team.relation_for_owner(person)
      relation.should be_admin
      relation.should be_developer
      relation.should_not be_public
    end
  end
end
