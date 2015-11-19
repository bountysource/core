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
    lambda {
      post :create, params.merge(slug: "beep-boop")
      assert_response :unprocessable_entity
    }.should_not change(Team, :count)
  end

  it "should require slug to create team" do
    lambda {
      post :create, params.merge(name: "Beep Boop")
      assert_response :unprocessable_entity
    }.should_not change(Team, :count)
  end

  it "should require auth to create team" do
    lambda {
      post :create
      assert_response :unauthorized
    }.should_not change(Team, :count)
  end

  it "should create team" do
    lambda {
      post :create, params.merge(name: "Adobe", slug: "adobe")
      assert_response :created
    }.should change(Team, :count).by 1
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
      get :show, params
      assert_response :ok

      response_data["name"].should be == team.name
      response_data["id"].should be == team.id
      response_data["slug"].should be == team.slug
      response_data["url"].should be == team.url
      response_data["image_url"].should be == team.image_url
    end

    it "should show trackers" do
      get :show, params
      response_data.should have_key "trackers"
      response_data["trackers"].length.should be == team.trackers.count
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
        put :update, params.merge(
          name: name,
          slug: slug,
          url: url,
          accepts_public_payins: false
        )
        assert_response :ok
        team.reload

        team.name.should be == name
        team.slug.should be == slug
        team.url.should be == url
        team.accepts_public_payins.should be_falsey
      end

      it "should require unique slug on update" do
        # create another team, give it a slug
        other_team = create(:team, slug: "adobe")

        lambda {
          put :update, params.merge(slug: other_team.slug)
          assert_response :unprocessable_entity
          team.reload
        }.should_not change(team, :slug)
      end

      it "should add tracker" do
        expect {
          post :add_tracker, params.merge(tracker_id: tracker.id)
          assert_response :ok
          team.reload
        }.to change(team.trackers, :count).by 1
      end

      it "should remove tracker" do
        # first, add a tracker
        new_tracker = create(:tracker)
        team.add_tracker(new_tracker)

        lambda {
          delete :remove_tracker, params.merge(tracker_id: new_tracker.id)
          assert_response :ok
          team.reload
        }.should change(team.trackers, :count).by -1
      end

      it "should add member" do
        new_member = create(:person)

        expect {
          post :add_member, params.merge(email: new_member.email)
          assert_response :ok
        }.to change(team.members, :count).by 1
      end

      context "with member" do
        let(:member) { create(:person) }
        before { team.add_member(member) }

        it "should update member to admin" do
          put :update_member, params.merge(member_id: member.id, admin: true)
          assert_response :ok

          relation = team.relation_for_owner(member)
          relation.reload.should be_admin
        end

        it "should update member to developer" do
          put :update_member, params.merge(member_id: member.id, developer: true)
          assert_response :ok

          relation = team.relation_for_owner(member)
          relation.reload.should be_developer
        end

        it "should update member to not public" do
          put :update_member, params.merge(member_id: member.id, public: false)
          assert_response :ok

          relation = team.relation_for_owner(member)
          relation.reload.should_not be_public
        end
      end
    end

    context "as developer" do
      let!(:developer) { create(:person) }
      before { team.add_member(developer, developer: true) }
      before { params.merge!(access_token: developer.create_access_token) }

      it "should update" do
        expect {
          put :update, params.merge(name: "I can has update?")
          assert_response :ok
        }.not_to change(team, :name)
      end

      it "should not add member" do
        rebel_scum = create(:person)

        expect {
          post :add_member, params.merge(email: rebel_scum.email)
          assert_response :forbidden
        }.not_to change(team.members, :length)
      end

      context "with member" do
        let(:glorious_leader) { create(:person) }
        before { team.add_member(glorious_leader, admin: true) }

        it "should not remove glorious leader" do
          expect {
            delete :remove_member, params.merge(member_id: glorious_leader.id)
            assert_response :forbidden
          }.not_to change(team.members, :count)
        end

        it "should not update glorious leader's permissions" do
          delete :remove_member, params.merge(member_id: glorious_leader.id)
          assert_response :forbidden

          glorious_leader.reload
          team.relation_for_owner(glorious_leader).should be_admin
        end
      end

      it "should add tracker" do
        expect {
          post :add_tracker, params.merge(tracker_id: tracker.id)
          assert_response :ok
        }.not_to change(team.trackers, :length)
      end

      it "should remove tracker" do
        new_tracker = create(:tracker)
        team.add_tracker(new_tracker)

        expect {
          delete :remove_tracker, params.merge(tracker_id: new_tracker.id)
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
          put :update, params.merge(name: "I can has update?")
          assert_response :forbidden
        }.not_to change(team, :name)
      end

      it "should not add member" do
        rebel_scum = create(:person)

        expect {
          post :add_member, params.merge(email: rebel_scum.email)
          assert_response :forbidden
        }.not_to change(team.members, :length)
      end

      context "with member" do
        let(:glorious_leader) { create(:person) }
        before { team.add_member(glorious_leader, admin: true) }

        it "should not remove glorious leader" do
          expect {
            delete :remove_member, params.merge(member_id: glorious_leader.id)
            assert_response :forbidden
          }.not_to change(team.members, :count)
        end

        it "should not update glorious leader's permissions" do
          delete :remove_member, params.merge(member_id: glorious_leader.id)
          assert_response :forbidden

          glorious_leader.reload
          team.relation_for_owner(glorious_leader).should be_admin
        end
      end

      it "should not add tracker" do
        expect {
          post :add_tracker, params.merge(tracker_id: tracker.id)
          assert_response :forbidden
        }.not_to change(team.trackers, :length)
      end

      it "should not remove tracker" do
        new_tracker = create(:tracker)
        team.add_tracker(new_tracker)

        expect {
          delete :remove_tracker, params.merge(tracker_id: new_tracker.id)
          assert_response :forbidden
        }.not_to change(team.trackers, :length)
      end
    end
  end

end
