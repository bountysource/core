require 'spec_helper'

describe Api::V1::FundraisersController do
  render_views

  let(:fundraiser_owner) { create(:person) }
  let(:team) { create(:team) }
  let!(:team_member_relation) { create(:team_member_relation, person: fundraiser_owner, team: team) }
  let(:fundraiser) { create(:fundraiser, person: fundraiser_owner, team: team) }
  let(:basic_params) { { access_token: fundraiser_owner.create_access_token } }
  let(:params) { basic_params }

  describe "fundraiser owners" do
    it "should return fundraisers" do
      get 'index', params: params
      expect(assigns(:fundraisers)).to eq(fundraiser_owner.fundraisers.order('published desc'))
    end

    it "should create a fundraiser" do
      expect {
        post 'create', params: params.merge!(build(:fundraiser, person: fundraiser_owner, team: team).attributes)
        assert_response :created
      }.to change(fundraiser_owner.fundraisers, :count).by 1
    end

    it "should create a fundraiser with just a title and team" do
      expect {
        post 'create', params: params.merge!(title: 'Look at my horse, my horse is amazing', team_id: team_member_relation.team_id)
        assert_response :created
      }.to change(fundraiser_owner.fundraisers, :count).by 1
    end

    it "should raise error on failed creation" do
      expect {
        post 'create', params: params
        assert_response :unprocessable_entity
      }.not_to change(fundraiser_owner.fundraisers, :count)
    end

    describe "require_fundraiser_ownership" do
      it "should return Fundraiser not found" do
        expect {
          post 'publish', params: params
        }.to raise_error(ActionController::UrlGenerationError)
      end
    end

    it "should not be visible to the public unless published" do
      fundraiser_draft = create(:fundraiser)
      expect(fundraiser_draft).not_to be_published

      get 'show', params: { id: fundraiser_draft.id }
      assert_response :not_found
    end

    describe "with a fundraiser already created" do
      let(:fundraiser) { create(:fundraiser) }
      let(:description) { "### Markup is awesome" }
      let!(:params) do
        {
          access_token: fundraiser.person.create_access_token,
          id:           fundraiser.id
        }
      end

      it "should show" do
        get 'show', params: params
        assert_response :ok
      end

      it "should have frontend_edit_url" do
        get 'show', params: params
        response_data = JSON.parse(response.body)
        expect(response_data).to have_key 'frontend_edit_path'
      end

      it "should have pledge count" do
        get 'show', params: params
        response_data = JSON.parse(response.body)
        expect(response_data).to have_key 'pledge_count'
      end

      it "should update" do
        expect {
          put 'update', params: params.merge(description: description)
          assert_response :ok
          fundraiser.reload
        }.to change(fundraiser, :description).to description
      end

      it "should update with empty data" do
        expect {
          put 'update', params: params.merge(description: "")
          assert_response :ok
          fundraiser.reload
        }.to change(fundraiser, :description).to ""
      end

      it "should delete" do
        expect {
          delete 'destroy', params: params
          assert_response :no_content
        }.to change(Fundraiser, :count).by -1
      end

      it "should not publish if missing required data" do
        fundraiser.update_attributes description: nil
        post 'publish', params: params
        assert_response :bad_request
      end

      it "publish if all required data present" do
        post 'publish', params: params
        assert_response :ok
      end

      describe "fundraiser published" do
        before do
          fundraiser.publish!
        end

        it "should show" do
          get 'show', params: params
          assert_response :ok
        end

        it "should not update funding goal" do
          expect {
            put 'update', params: params.merge(funding_goal: 1337)
            assert_response :unprocessable_entity
          }.not_to change(fundraiser, :funding_goal)
        end

        it "should not update duration" do
          expect {
            put 'update', params: params.merge(days_open: 42)
            assert_response :unprocessable_entity
          }.not_to change(fundraiser, :funding_goal)
        end

        it "should not delete" do
          expect {
            delete 'destroy', params: params
            assert_response :bad_request
          }.not_to change(fundraiser_owner.fundraisers, :count)
        end
      end

      describe "plebian scum" do
        let!(:params) do
          {
            access_token: create(:person).create_access_token,
            id:           fundraiser.id
          }
        end

        it "should not have frontend_edit_url" do
          get 'show', params: params
          expect(JSON.parse(response.body).with_indifferent_access).not_to have_key :frontend_edit_url
        end

        it "should not be able to edit" do
          expect {
            put 'update', params: params.merge(description: "U r hacked")
            assert_response :not_found
          }.not_to change(fundraiser, :description)
        end

        it "should not be able to delete" do
          expect {
            delete 'destroy', params: params
            assert_response :not_found
          }.not_to change(fundraiser_owner.fundraisers, :count)
        end
      end
    end

  end

  describe '#pledges' do
    let(:person) { create(:person) }
    let!(:reward1) { create(:reward, fundraiser: fundraiser, description: "Reward #1", amount: 10) }
    let!(:reward2) { create(:reward, fundraiser: fundraiser, description: "Reward #2", amount: 50) }
    let!(:pledge1) { create(:pledge, person: person, fundraiser: fundraiser, reward: reward1, amount: 10) }
    let!(:pledge2) { create(:pledge, person: person, fundraiser: fundraiser, reward: reward2, amount: 50) }
    let!(:pledge3) { create(:pledge, person: person, fundraiser: fundraiser, amount: 5) }

    let!(:response_data) do
      get :info, params: params.merge(id: fundraiser.id)
      response_data = JSON.parse(response.body).with_indifferent_access
    end

    it "should be successful" do
      assert_response :ok
    end

    it "should render pledges for each reward, including" do
      rewards = response_data[:rewards]

      resp_reward1    = rewards.detect { |reward| reward['id'] == reward1.id }
      resp_reward2    = rewards.detect { |reward| reward['id'] == reward2.id }

      expect(resp_reward1['pledges'].count).to eq(1)
      expect(resp_reward1['pledges'].first["id"]).to eq(pledge1.id)
      expect(resp_reward1['pledges'].first["amount"].to_f).to eq(pledge1.amount)

      expect(resp_reward2['pledges'].count).to eq(1)
      expect(resp_reward2['pledges'].first["id"]).to eq(pledge2.id)
      expect(resp_reward2['pledges'].first["amount"].to_f).to eq(pledge2.amount)
    end
  end

  describe "admin override" do
    let!(:admin_overlord)   { create(:person, admin: true) }
    let!(:rebel_scum)       { create(:person, admin: false) }
    let!(:doesnt_even_lift) { create(:person, admin: false) }
    let!(:fundraiser)       { create(:published_fundraiser, person: rebel_scum) }
    let!(:params) do
      {
        access_token: admin_overlord.create_access_token,
        id:           fundraiser.id
      }
    end

    it "should show admin as owner in fundraiser show response" do
      get 'show', params: params
      assert_response :ok

      response_data = JSON.parse(response.body)
      expect(response_data['owner']).to be_truthy
    end

    it "should make owner field false person who is neither admin nor fundraiser owner" do
      get 'show', params: params.merge(access_token: doesnt_even_lift.create_access_token)
      assert_response :ok

      response_data = JSON.parse(response.body)
      expect(response_data['owner']).not_to be_truthy
    end

    it "should allow admin to view info" do
      get 'info', params: params
      assert_response :ok
    end

    it "should allow admin to update fundraiser" do
      short_description = "I am the law"

      expect {
        put 'update', params: params.merge(short_description: short_description)
        assert_response :ok
        fundraiser.reload
      }.to change(fundraiser, :short_description).to short_description
    end
  end

  describe "cards" do
    let!(:in_progress_fundraiser) do
      create(:published_fundraiser,
        featured:     true,
        funding_goal: 100
      )
    end

    let!(:completed_fundraiser)   do
      fundraiser = create(:published_fundraiser,
        featured:       true,
        funding_goal:   100,
        total_pledged:  500
      )
      fundraiser.update_attribute :ends_at, DateTime.now - (fundraiser.days_open + 5).days
      fundraiser
    end

    let!(:failed_fundraiser) do
      fundraiser = create(:published_fundraiser,
        featured:       true,
        funding_goal:   100,
        total_pledged:  1
      )
      fundraiser.update_attribute :ends_at, DateTime.now - (fundraiser.days_open + 5).days
      fundraiser
    end

    let!(:response_data) {
      get 'cards'
      JSON.parse(response.body)
    }

    it "should work" do
      assert_response :ok
    end

    it "should have keys for in_progress and completed fundraisers" do
      expect(response_data).to have_key 'in_progress'
      expect(response_data).to have_key 'completed'
    end

    it "should only include fundraisers in progress" do
      expect(response_data['in_progress'].count).to eq(1)
      expect(response_data['in_progress'][0]['id']).to eq(in_progress_fundraiser.id)
    end

    it "should only include fundraiser that has been completed" do
      expect(response_data['completed'].count).to eq(1)
      expect(response_data['completed'][0]['id']).to eq(completed_fundraiser.id)
    end
  end

  describe "hidden" do
    let!(:visible) { create(:published_fundraiser, hidden: 0) }
    let!(:hidden) { create(:published_fundraiser, hidden: 1) }

    it "should not include hidden fundraisers in #all" do
      get :all
      fundraisers = JSON.parse(response.body)
      expect(fundraisers.map { |k,v| v if k.to_s == "id" }).not_to include hidden.id
    end
  end
end
