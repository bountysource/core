require 'spec_helper'

describe Api::V1::DeveloperGoalsController do
  render_views

  let(:issue) { create(:issue) }
  let(:person) { create(:person) }

  let!(:params) do
    {
      access_token: person.create_access_token,
      id: issue.id
    }
  end

  it "should create a developer goal" do
    expect {
      post :create, params.merge(amount: 100)
      assert_response :created
    }.to change(issue.developer_goals, :count).by 1
  end

  it "should create an activity log when the developer goal is created" do
    expect {
      post :create, params.merge(amount: 100)
    }.to change(ActivityLog, :count).by 1
  end

  it "should require auth to create" do
    expect {
      params.delete(:access_token)
      post :create, params
      assert_response :unauthorized
    }.not_to change(issue.developer_goals, :count)
  end

  it "should require issue to create" do
    expect {
      params.delete(:id)
      expect {
        post :create, params
      }.to raise_error(ActionController::UrlGenerationError)
    }.not_to change(issue.developer_goals, :count)
  end

  it "should require amount to create" do
    expect {
      post :create, params
      assert_response :unprocessable_entity
    }.not_to change(issue.developer_goals, :count)
  end

  context "with developer goal created" do
    let!(:developer_goal) { create(:developer_goal, person: person, issue: issue) }

    it "should be idempotent on create" do
      expect {
        10.times do
          post :create, params.merge(amount: 200)
          assert_response :not_modified
        end
      }.not_to change(issue.developer_goals, :count)
    end

    it "should update goal amount" do
      expect {
        put :update, params.merge(amount: developer_goal.amount + 100)
        assert_response :ok
        developer_goal.reload
      }.to change(developer_goal, :amount).by 100
    end

    it "should create an activity log when a developer goal is updated" do
      expect {
        put :update, params.merge(amount: developer_goal.amount + 100)
      }.to change(ActivityLog, :count).by 1
    end

    it "should get all goals for issue" do
      get :index, params
      assert_response :ok

      index_response = JSON.parse(response.body)
      index_response.first["id"].should be == developer_goal.id
    end

    it "should not require auth for issue goal index" do
      params.delete(:access_token)
      get :index, params
      assert_response :ok
    end

    it "should destroy a developer goal" do
      expect {
        delete :destroy, params
        assert_response :ok
      }.to change(issue.developer_goals, :count).by -1
    end

    it "should create an activity log when a developer goal is destroyed" do
      expect {
        delete :destroy, params
      }.to change(ActivityLog, :count).by 1
    end

    it "should show the authenticated user's goal for the issue" do
      get :show, params
      assert_response :ok

      show_response = JSON.parse(response.body)
      show_response["id"].should be == developer_goal.id
    end
  end
end
