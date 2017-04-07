require 'spec_helper'

describe Api::V1::PeopleController do
  render_views

  let(:person) { create(:person) }
  let(:params) do
    { access_token: person.create_access_token }
  end
  let(:response_data) { JSON.parse(response.body).with_indifferent_access }

  it "should be able to add paypal email" do
    paypal_email = 'ihazpaypal@gmail.com'

    lambda {
      put :update, params.merge(paypal_email: paypal_email)
      assert_response :ok
      person.reload
    }.should change(person, :paypal_email).to paypal_email
  end

  describe "password reset requests" do
    let(:Person) { class_double('Person') }

    before do
      Person.stub(:find_by_email).and_return(person)
    end

    it "sends pw reset for bountysource by default" do
      expect(person).to receive(:send_email).with(:reset_password, site_url: Api::Application.config.www_url).once
      post :request_password_reset, {email: person.email}
    end

    it "sends pw reset for salt when requested" do
      expect(person).to receive(:send_email).with(:reset_password, site_url: Api::Application.config.salt_url).once
      post :request_password_reset, {email: person.email, is_salt: true}
    end
  end

  describe "access token" do
    let!(:person) { create(:person, email: 'test@test.com',
                           password: 'abcABC123', password_confirmation: 'abcABC123') }
    let!(:params) { { email: person.email,
                      password: 'abcABC123', password_confirmation: 'abcABC123' } }
    let!(:response_data) {
      post 'login', params
      JSON.parse(response.body)
    }

    it "should have an access token in login" do
      response_data.should have_key 'access_token'
    end
  end

  describe "tracker plugins" do
    let(:person)          { create(:person) }
    let(:linked_account)  { create(:github_account, person: person) }

    let!(:tracker_plugin) do
      TrackerPlugin.any_instance.stub(:linked_account_can_write?).and_return(true)
      TrackerPlugin.any_instance.stub(:can_modify_repo?).and_return(true)

      create(:tracker_plugin, person: person)
    end

    let(:params) { { access_token: person.create_access_token } }

    # No longer routed to
    xit "should show tracker plugins" do
      get :tracker_plugins, params
      assert_response :ok
    end
  end

  describe "projects" do
    let(:person)            { create(:person) }
    let(:linked_account)    { create(:github_account, person: person) }
    let(:tracker)           { create(:tracker) }
    let(:tracker_relation)  { create(:tracker_committer_relation, linked_account: linked_account, tracker: tracker) }

    let(:params) { { access_token: person.create_access_token } }

    # no longer routed to
    xit "should show projects through tracker relations" do
      get :project_relations, params
      assert_response :ok
    end
  end

  describe "languages" do
    let(:person) { create(:person) }
    let!(:language1) { create(:language, name: 'shibe.js') }
    let!(:language2) { create(:language, name: 'D') }
    let(:params) { { access_token: person.create_access_token } }

    it "should require auth to change" do
      post :set_languages
      assert_response :unauthorized
    end

    it "should add languages" do
      post :set_languages, params.merge(language_ids: [language1.id, language2.id].join(','))
      assert_response :ok

      person.reload
      person.languages.should include language1
      person.languages.should include language2
    end

    it "should remove languages" do
      person.set_languages(language1.id, language2.id)
      person.languages.should include language1
      person.languages.should include language2

      delete :set_languages, params.merge(language_ids: language2.id)
      assert_response :ok

      person.reload
      person.languages.should_not include language1
      person.languages.should include language2
    end
  end
end
