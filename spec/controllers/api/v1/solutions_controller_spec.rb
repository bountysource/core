require 'spec_helper'

describe Api::V1::SolutionsController do
  render_views

  let!(:person) { create(:person) }
  let!(:issue) { create(:issue) }
  let!(:solution) { create(:solution) }

  let(:params) do
    {
      access_token: person.create_access_token,
      issue_id: issue.id,
    }
  end

  let(:existing_params) do #for when there is already a solution object
    {
      access_token: solution.person.create_access_token,
      issue_id: solution.issue.id,
      id: solution.id
    }
  end

  it "should return no content if user hasn't started work on an issue" do
    params[:access_token] = create(:person).create_access_token
    expect {
      get :show, params
      assert_response :not_found
    }.not_to change(person.solutions, :count)
  end

  it "should require an access token to create solution" do
    params.delete(:access_token)
    expect {
      post :create, params
      assert_response :unauthorized
    }.not_to change(person.solutions, :count)
  end

  it "should require an issue to create a solution" do
    params.delete(:issue_id)
    expect {
      expect {
        post :create, params
      }.to raise_error(ActionController::UrlGenerationError)
    }.not_to change(person.solutions, :count)
  end

  it "should create a solution" do
    expect {
      post :create, params
      assert_response :created
    }.to change(person.solutions, :count).by 1
  end

  it "should create a SolutionEvent::Started object for a new Solution object" do
    expect {
      post :create, params
      assert_response :created
      #hacky solution to check if SolutionEvent was created: person.solution.first.solution_events was not working
    }.to change(SolutionEvent, :count).by 1
  end

  it "should create a SolutionEvent::Stopped object for an existing Solution" do
    expect {
      post :stop_work, existing_params
      assert_response :ok
    }.to change(SolutionEvent::Stopped, :count).by 1
  end

  it "should create a SolutionEvent::Started object for an existing Solution" do
    expect {
      post :start_work, existing_params
      assert_response :ok
    }.to change(SolutionEvent::Started, :count).by 1
  end

  it "should create a SolutionEvent::Completed object for an existing Solution" do
    expect {
      post :complete_work, existing_params
      assert_response :ok
    }.to change(SolutionEvent::Completed, :count).by 1
  end

  it "should create a SolutionEvent::CheckedIn object for an existing Solution" do
    expect {
      post :check_in, existing_params
      assert_response :ok
    }.to change(SolutionEvent::CheckedIn, :count).by 1
  end

  describe "activity log" do
    it "should log when a Solution is started" do
      expect {
        post :create, params
      }.to change(ActivityLog, :count).by 1
    end

    it "should log when a Solution is re-started" do
      expect {
        post :start_work, existing_params
      }.to change(ActivityLog, :count).by 1
    end

    it "should log when a Solution is stopped" do
      expect {
        post :stop_work, existing_params
      }.to change(ActivityLog, :count).by 1
    end
  end
end
