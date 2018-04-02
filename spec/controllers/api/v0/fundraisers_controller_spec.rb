require 'spec_helper'

describe Api::V0::FundraisersController do
  render_views

  let(:admin)     { create(:person, admin: true) }
  let(:non_admin) { create(:person) }

  describe "as admin" do
    let(:fundraiser) { create(:fundraiser) }
    let(:tracker) { create(:tracker) }
    let(:fundraiser_tracker_relation) { create(:fundraiser_tracker_relation, tracker: tracker, fundraiser: fundraiser) }

    let(:params) do
      { access_token: admin.create_access_token+".#{Api::Application.config.admin_secret}", id: fundraiser.id, tracker_id: tracker.id}
    end

    describe "tracker relations" do
      it "should return the trackers associated with a fundraiser" do
        params.delete(:tracker_id)
        get :tracker_relations, params: params
        assert_response :ok
      end
    end

    describe "add tracker relation" do
      it "should create a new relation between a tracker and fundraiser" do
        expect {
          post :add_tracker_relation, params: params
        }.to change(fundraiser.trackers, :count).by 1
      end

      it "should return errors if the relation is invalid" do
        fundraiser_tracker_relation #initialize
        post :add_tracker_relation, params: params
        assert_response :unprocessable_entity
      end
    end

    describe "remove tracker relation" do
      it "should allow a relation between a tracker and fundraiser to be destroyed" do
        fundraiser_tracker_relation #initialize
        expect {
          delete :remove_tracker_relation, params: params
        }.to change(fundraiser.trackers, :count).by -1
      end
    end

  end

  describe "as non_admin" do

  end

end
