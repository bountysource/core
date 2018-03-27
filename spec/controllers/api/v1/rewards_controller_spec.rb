require 'spec_helper'

describe Api::V1::RewardsController do
  render_views

  let(:fundraiser_owner) { create(:person) }
  let(:fundraiser) { create(:fundraiser, person_id: fundraiser_owner.id) }
  let(:basic_params) { { access_token: fundraiser_owner.create_access_token, fundraiser_id: fundraiser.to_param } }
  let(:params) { basic_params }

  describe "require_fundraiser" do
    it "should return Fundraiser not found" do
      expect {
        get 'index'
      }.to raise_error(ActionController::UrlGenerationError)
    end
  end

  describe "require_reward" do
    it "should return Reward not found" do
      expect {
        get 'show', params: params
      }.to raise_error(ActionController::UrlGenerationError)
    end
  end

  describe "as the fundraiser owner" do

    it "should create a reward" do
      lambda {
        post 'create', params: params.merge(amount: 10, description: "My awesome reward")
        assert_response :created
      }.should change(fundraiser.rewards, :count).by 1

      fundraiser.rewards.last.description.should == "My awesome reward"
      fundraiser.rewards.last.amount.should == 10
    end

    describe "with reward" do
      let!(:reward) { fundraiser.rewards.create amount: 1337, description: "TF2 is for casuals" }
      let!(:params) { basic_params.merge! id: reward.id }
      let(:description) { "awesome description here" }

      let(:fulfillment_details) { "What is your mailing address?" }

      it "should show all" do
        get 'index', params: params
        assert_response :ok
      end

      it "should show a single reward" do
        get 'show', params: params
        assert_response :ok
      end

      it "should update amount" do
        lambda {
          put 'update', params: params.merge(amount: 12345)
          assert_response :ok
          reward.reload
        }.should change(reward, :amount).to 12345
      end

      it "should update quantity" do
        lambda {
          put 'update', params: params.merge(limited_to: 420)
          assert_response :ok
          reward.reload
        }.should change(reward, :limited_to).to 420
      end

      it "should update description" do
        lambda {
          put 'update', params: params.merge(description: description)
          assert_response :ok
          reward.reload
        }.should change(reward, :description).to description
      end

      it "should update fullfillment details" do

        lambda {
          put 'update', params: params.merge(fulfillment_details: fulfillment_details)
          assert_response :ok
          reward.reload
        }.should change(reward, :fulfillment_details).to fulfillment_details
      end

      it "should be deleted" do
        lambda {
          delete 'destroy', params: params
          assert_response :no_content
        }.should change(fundraiser.rewards, :count).by -1
      end

      describe "fundraiser is published" do
        before do
          fundraiser.publish!
        end

        it "should not update description" do
          lambda {
            put 'update', params: params.merge(description: "Swagger 4 dayz")
            assert_response :unprocessable_entity
            reward.reload
          }.should_not change(reward, :description)
        end

        it "should update quantity" do
          lambda {
            put 'update', params: params.merge(limited_to: 420)
            assert_response :ok
            reward.reload
          }.should change(reward, :limited_to).to 420
        end

        it "should not update amount" do
          lambda {
            put 'update', params: params.merge(amount: 420)
            assert_response :unprocessable_entity
            reward.reload
          }.should_not change(reward, :amount)
        end

        it "should update fullfillment details" do
          lambda {
            put 'update', params: params.merge(fulfillment_details: fulfillment_details)
            assert_response :ok
            reward.reload
          }.should change(reward, :fulfillment_details).to fulfillment_details
        end

        it "should not be deleted" do
          lambda {
            delete 'destroy', params: params
            assert_response :bad_request
          }.should_not change(fundraiser.rewards, :count)
        end
      end
    end
  end

  describe "as plebian scum" do
    let!(:plebian_scum) { create(:person) }
    let!(:basic_params) { { access_token: plebian_scum.create_access_token, fundraiser_id: fundraiser.to_param } }

    it "should not create" do
      lambda {
        post 'create', params: params.merge(amount: 10, description: "My awesome reward")
        assert_response :not_found
      }.should_not change(fundraiser.rewards, :count)
    end

    describe "with reward" do
      let!(:reward) { fundraiser.rewards.create amount: 1337, description: "TF2 is for casuals" }
      let!(:params) { basic_params.merge! id: reward.id }

      it "should show all" do
        get 'index', params: params
        assert_response :ok
      end

      it "should show a single" do
        get 'show', params: params
        assert_response :ok
      end

      it "should not be updated" do
        put 'update', params: params.merge(description: "I'm in ur base")
        assert_response :not_found
        reward.reload
        expect(reward.description).to eq("TF2 is for casuals")
      end

      it "should not be deleted" do
        lambda {
          delete 'destroy', params: params
          assert_response :not_found
        }.should_not change(fundraiser.rewards, :count)
      end
    end
  end
end
