require 'spec_helper'

describe Api::V1::TrackerPluginsController do
  render_views

  let!(:person)          { create(:person) }
  let!(:tracker)         { create(:tracker) }
  let!(:linked_account)  { create(:github_account, person: person) }

  let(:params) do
    {
      access_token:       person.create_access_token,
      linked_account_id:  linked_account.id,
      tracker_id:         tracker.id
    }
  end

  let(:response_data) { JSON.parse(response.body) }

  describe "create" do
    before do
      LinkedAccount::Github.any_instance.stub(:permissions) { %w(public_repo) }
      LinkedAccount::Github.any_instance.stub(:can_modify_repository?).with(tracker) { true }
    end

    it "should require auth" do
      lambda {
        post :create
        assert_response :unauthorized

        linked_account.reload
      }.should_not change(person.tracker_plugins, :count)
    end

    it "should require linked_account" do
      lambda {
        person.github_account = nil

        params.delete :linked_account_id
        post :create, params
        assert_response :bad_request

        linked_account.reload
      }.should_not change(person.tracker_plugins, :count)
    end

    it "should require tracker" do
      lambda {
        params.delete :tracker_id
        post :create, params
        assert_response :not_found

        linked_account.reload
      }.should_not change(person.tracker_plugins, :count)
    end

    it "should create a tracker_plugin" do
      lambda {
        post :create, params
        assert_response :created

        linked_account.reload
      }.should change(person.tracker_plugins, :count).by 1
    end

    context "missing public_repo permission" do
      it "should not create tracker plugin if linked account cannot write" do
        LinkedAccount::Github.any_instance.should_receive(:can_modify_repository?).and_return(false)

        lambda {
          post :create, params
          assert_response :failed_dependency
          linked_account.reload
        }.should_not change(person.tracker_plugins, :count)
      end
    end
  end

  context "with tracker plugin" do
    let!(:tracker_plugin)  { create(:tracker_plugin, tracker: tracker, person: person) }
    let(:params) do
      {
        access_token: linked_account.person.create_access_token,
        tracker_id:   tracker.id
      }
    end

    it "should render index" do
      get :index, params
      assert_response :ok
    end

    it "should render show" do
      get :show, params
      assert_response :ok
      response_data['id'].should == tracker_plugin.id
    end

    it "should update modify_title" do
      lambda {
        put :update, params.merge(modify_title: !tracker_plugin.modify_title?)
        assert_response :ok

        tracker_plugin.reload
      }.should change(tracker_plugin, :modify_title)
    end

    it "should update add_label" do
      lambda {
        put :update, params.merge(add_label: !tracker_plugin.add_label)
        assert_response :ok

        tracker_plugin.reload
      }.should change(tracker_plugin, :add_label)
    end

    it "should destroy plugin" do
      lambda {
        delete :destroy, params
        assert_response :no_content
      }.should change(person.tracker_plugins, :count).by -1
    end

    context "not change if not the owner of the plugin" do
      let(:rebel_scum) { create(:person) }
      let(:params) do
        {
          access_token: rebel_scum.create_access_token,
          tracker_id:   tracker.id
        }
      end

      it "should not update add bounty to title" do
        lambda {
          put :update, params.merge(add_label: !tracker_plugin.modify_title)
          assert_response :not_found
          tracker_plugin.reload
        }.should_not change(tracker_plugin, :modify_title)
      end

      it "should not update add label" do
        lambda {
          put :update, params.merge(add_label: !tracker_plugin.add_label)
          assert_response :not_found
          tracker_plugin.reload
        }.should_not change(tracker_plugin, :add_label)
      end

      it "should not delete" do
        lambda {
          delete :destroy, params
          assert_response :not_found
        }.should_not change(person.tracker_plugins, :count)
      end
    end
  end
end
