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
    lambda {
      put :follow, params
      assert_response :ok
    }.should change(person.follow_relations, :count).by 1
  end

  it "should be idempotent" do
    lambda {
      10.times { put :follow, params }
    }.should change(person.follow_relations, :count).by 1
  end

  it "should create a tracker-follow activity-log" do
    expect {
      put :follow, params
    }.to change(ActivityLog, :count).by 1
  end

  context "with follow" do
    let!(:follow_relation) { create(:follow_relation, person: person, item: tracker) }

    it "should unfollow the tracker" do
      lambda {
        delete :unfollow, params
        assert_response :ok
        follow_relation.reload
      }.should change(follow_relation, :active).to false
    end

    it "should not destroy the follow_relation on unfollow" do
      lambda {
        delete :unfollow, params
        assert_response :ok
      }.should_not change(person.follow_relations, :count)
    end

    it "should create a tracker unfollow activity log" do
      expect {
        put :follow, params
      }.to change(ActivityLog, :count).by 1
    end
  end

end
