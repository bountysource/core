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
      allow_any_instance_of(LinkedAccount::Github).to receive(:permissions) { %w(public_repo) }
      allow_any_instance_of(LinkedAccount::Github).to receive(:can_modify_repository?).with(tracker) { true }
    end

    it "should require auth" do
      expect {
        post :create
        assert_response :unauthorized

        linked_account.reload
      }.not_to change(person.tracker_plugins, :count)
    end

    it "should require linked_account" do
      expect {
        person.github_account = nil

        params.delete :linked_account_id
        post :create, params: params
        assert_response :bad_request

        linked_account.reload
      }.not_to change(person.tracker_plugins, :count)
    end

    it "should require tracker" do
      expect {
        params.delete :tracker_id
        post :create, params: params
        assert_response :not_found

        linked_account.reload
      }.not_to change(person.tracker_plugins, :count)
    end

    it "should create a tracker_plugin" do
      expect {
        post :create, params: params
        assert_response :created

        linked_account.reload
      }.to change(person.tracker_plugins, :count).by 1
    end

    context "missing public_repo permission" do
      it "should not create tracker plugin if linked account cannot write" do
        expect_any_instance_of(LinkedAccount::Github).to receive(:can_modify_repository?).and_return(false)

        expect {
          post :create, params: params
          assert_response :failed_dependency
          linked_account.reload
        }.not_to change(person.tracker_plugins, :count)
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
      get :index, params: params
      assert_response :ok
    end

    it "should render show" do
      get :show, params: params
      assert_response :ok
      expect(response_data['id']).to eq(tracker_plugin.id)
    end

    it "should update modify_title" do
      expect {
        put :update, params: params.merge(modify_title: !tracker_plugin.modify_title?)
        assert_response :ok

        tracker_plugin.reload
      }.to change(tracker_plugin, :modify_title)
    end

    it "should update add_label" do
      expect {
        put :update, params: params.merge(add_label: !tracker_plugin.add_label)
        assert_response :ok

        tracker_plugin.reload
      }.to change(tracker_plugin, :add_label)
    end

    it "should destroy plugin" do
      expect {
        delete :destroy, params: params
        assert_response :no_content
      }.to change(person.tracker_plugins, :count).by -1
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
        expect {
          put :update, params: params.merge(add_label: !tracker_plugin.modify_title)
          assert_response :not_found
          tracker_plugin.reload
        }.not_to change(tracker_plugin, :modify_title)
      end

      it "should not update add label" do
        expect {
          put :update, params: params.merge(add_label: !tracker_plugin.add_label)
          assert_response :not_found
          tracker_plugin.reload
        }.not_to change(tracker_plugin, :add_label)
      end

      it "should not delete" do
        expect {
          delete :destroy, params: params
          assert_response :not_found
        }.not_to change(person.tracker_plugins, :count)
      end
    end
  end
end
