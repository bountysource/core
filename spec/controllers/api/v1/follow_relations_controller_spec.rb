require 'spec_helper'

describe Api::V1::FollowRelationsController do

  let!(:tracker)  { create(:tracker) }
  let!(:person)   { create(:person) }

  let(:params) do
    {
      access_token: person.create_access_token,
      item_id:      tracker.id,
      item_type:    tracker.class.name
    }
  end

  it "should follow the tracker" do
    expect {
      put :follow, params: params
      assert_response :ok
    }.to change(person.follow_relations, :count).by 1
  end

  it "should be idempotent" do
    expect {
      10.times { put :follow, params: params }
    }.to change(person.follow_relations, :count).by 1
  end

  it "should create a tracker-follow activity-log" do
    expect {
      put :follow, params: params
    }.to change(ActivityLog, :count).by 1
  end

  context "with follow" do
    let!(:follow_relation) { create(:follow_relation, person: person, item: tracker) }

    it "should unfollow the tracker" do
      expect {
        delete :unfollow, params: params
        assert_response :ok
        follow_relation.reload
      }.to change(follow_relation, :active).to false
    end

    it "should not destroy the follow_relation on unfollow" do
      expect {
        delete :unfollow, params: params
        assert_response :ok
      }.not_to change(person.follow_relations, :count)
    end

    it "should create a tracker unfollow activity log" do
      expect {
        put :follow, params: params
      }.to change(ActivityLog, :count).by 1
    end
  end

end
