require 'spec_helper'

describe Api::V1::TeamsController do
  render_views

  let!(:person) { create :person }
  let!(:tracker) { create :tracker }
  let(:response_data) { JSON.parse(response.body) }
  let(:params) do
    { access_token: person.create_access_token }
  end

  it "should require name to create team" do
    expect {
      post :create, params: params.merge(slug: "beep-boop")
      assert_response :unprocessable_entity
    }.not_to change(Team, :count)
  end

  it "should require slug to create team" do
    expect {
      post :create, params: params.merge(name: "Beep Boop")
      assert_response :unprocessable_entity
    }.not_to change(Team, :count)
  end

  it "should require auth to create team" do
    expect {
      post :create
      assert_response :unauthorized
    }.not_to change(Team, :count)
  end

  it "should create team" do
    expect {
      post :create, params: params.merge(name: "Adobe", slug: "adobe")
      assert_response :created
    }.to change(Team, :count).by 1
  end

  context "with team" do
    let!(:team) { create(:team, name: "Adobe", accepts_public_payins: true) }
    let(:params) do
      {
        access_token: person.create_access_token,
        id: team.slug
      }
    end

    it "should show" do
      get :show, params: params
      assert_response :ok

      expect(response_data["name"]).to eq(team.name)
      expect(response_data["id"]).to eq(team.id)
      expect(response_data["slug"]).to eq(team.slug)
      expect(response_data["url"]).to eq(team.url)
      expect(response_data["image_url"]).to eq(team.image_url)
    end

    it "should show trackers" do
      get :show, params: params
      expect(response_data).to have_key "trackers"
      expect(response_data["trackers"].length).to eq(team.trackers.count)
    end

    context "as admin" do
      let!(:admin) { create(:person) }
      before do
        team.add_member(admin, admin: true)
        params.merge!(access_token: admin.create_access_token)
      end

      it "should update team" do
        name = "Taco Corp."
        slug = "taco-corp"
        url = "https://www.dallascowbos.com/"
        put :update, params: params.merge(
          name: name,
          slug: slug,
          url: url,
          accepts_public_payins: false
        )
        assert_response :ok
        team.reload

        expect(team.name).to eq(name)
        expect(team.slug).to eq(slug)
        expect(team.url).to eq(url)
        expect(team.accepts_public_payins).to be_falsey
      end

      it "should require unique slug on update" do
        # create another team, give it a slug
        other_team = create(:team, slug: "adobe")

        expect {
          put :update, params: params.merge(slug: other_team.slug)
          assert_response :unprocessable_entity
          team.reload
        }.not_to change(team, :slug)
      end

      it "should add tracker" do
        expect {
          post :add_tracker, params: params.merge(tracker_id: tracker.id)
          assert_response :ok
          team.reload
        }.to change(team.trackers, :count).by 1
      end

      it "should remove tracker" do
        # first, add a tracker
        new_tracker = create(:tracker)
        team.add_tracker(new_tracker)

        expect {
          delete :remove_tracker, params: params.merge(tracker_id: new_tracker.id)
          assert_response :ok
          team.reload
        }.to change(team.trackers, :count).by -1
      end

      it "should add member" do
        new_member = create(:person)

        expect {
          post :add_member, params: params.merge(email: new_member.email)
          assert_response :ok
        }.to change(team.members, :count).by 1
      end

      context "with member" do
        let(:member) { create(:person) }
        before { team.add_member(member) }

        it "should update member to admin" do
          put :update_member, params: params.merge(member_id: member.id, admin: true)
          assert_response :ok

          relation = team.relation_for_owner(member)
          expect(relation.reload).to be_admin
        end

        it "should update member to developer" do
          put :update_member, params: params.merge(member_id: member.id, developer: true)
          assert_response :ok

          relation = team.relation_for_owner(member)
          expect(relation.reload).to be_developer
        end

        it "should update member to not public" do
          put :update_member, params: params.merge(member_id: member.id, public: false)
          assert_response :ok

          relation = team.relation_for_owner(member)
          expect(relation.reload).not_to be_public
        end
      end
    end

    context "as developer" do
      let!(:developer) { create(:person) }
      before { team.add_member(developer, developer: true) }
      before { params.merge!(access_token: developer.create_access_token) }

      it "should update" do
        expect {
          put :update, params: params.merge(name: "I can has update?")
          assert_response :ok
        }.not_to change(team, :name)
      end

      it "should not add member" do
        rebel_scum = create(:person)

        expect {
          post :add_member, params: params.merge(email: rebel_scum.email)
          assert_response :forbidden
        }.not_to change(team.members, :length)
      end

      context "with member" do
        let(:glorious_leader) { create(:person) }
        before { team.add_member(glorious_leader, admin: true) }

        it "should not remove glorious leader" do
          expect {
            delete :remove_member, params: params.merge(member_id: glorious_leader.id)
            assert_response :forbidden
          }.not_to change(team.members, :count)
        end

        it "should not update glorious leader's permissions" do
          delete :remove_member, params: params.merge(member_id: glorious_leader.id)
          assert_response :forbidden

          glorious_leader.reload
          expect(team.relation_for_owner(glorious_leader)).to be_admin
        end
      end

      it "should add tracker" do
        expect {
          post :add_tracker, params: params.merge(tracker_id: tracker.id)
          assert_response :ok
        }.not_to change(team.trackers, :length)
      end

      it "should remove tracker" do
        new_tracker = create(:tracker)
        team.add_tracker(new_tracker)

        expect {
          delete :remove_tracker, params: params.merge(tracker_id: new_tracker.id)
          assert_response :ok
        }.not_to change(team.trackers, :length)
      end
    end

    context "as public" do
      let!(:public_member) { create(:person) }
      before { team.add_member(public_member, public: true, admin: false, developer: false) }
      before { params.merge!(access_token: public_member.create_access_token) }

      it "should not update" do
        expect {
          put :update, params: params.merge(name: "I can has update?")
          assert_response :forbidden
        }.not_to change(team, :name)
      end

      it "should not add member" do
        rebel_scum = create(:person)

        expect {
          post :add_member, params: params.merge(email: rebel_scum.email)
          assert_response :forbidden
        }.not_to change(team.members, :length)
      end

      context "with member" do
        let(:glorious_leader) { create(:person) }
        before { team.add_member(glorious_leader, admin: true) }

        it "should not remove glorious leader" do
          expect {
            delete :remove_member, params: params.merge(member_id: glorious_leader.id)
            assert_response :forbidden
          }.not_to change(team.members, :count)
        end

        it "should not update glorious leader's permissions" do
          delete :remove_member, params: params.merge(member_id: glorious_leader.id)
          assert_response :forbidden

          glorious_leader.reload
          expect(team.relation_for_owner(glorious_leader)).to be_admin
        end
      end

      it "should not add tracker" do
        expect {
          post :add_tracker, params: params.merge(tracker_id: tracker.id)
          assert_response :forbidden
        }.not_to change(team.trackers, :length)
      end

      it "should not remove tracker" do
        new_tracker = create(:tracker)
        team.add_tracker(new_tracker)

        expect {
          delete :remove_tracker, params: params.merge(tracker_id: new_tracker.id)
          assert_response :forbidden
        }.not_to change(team.trackers, :length)
      end
    end
  end

end
