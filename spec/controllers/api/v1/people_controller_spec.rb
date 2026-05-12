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

    expect {
      put :update, params: params.merge(paypal_email: paypal_email)
      assert_response :ok
      person.reload
    }.to change(person, :paypal_email).to paypal_email
  end

  describe "access token" do
    let!(:person) { create(:person, email: 'test@test.com',
                           password: 'abcABC123', password_confirmation: 'abcABC123') }
    let!(:params) { { email: person.email,
                      password: 'abcABC123', password_confirmation: 'abcABC123' } }
    let!(:response_data) {
      post 'login', params: params
      JSON.parse(response.body)
    }

    it "should have an access token in login" do
      expect(response_data).to have_key 'access_token'
    end
  end

  describe "tracker plugins" do
    let(:person)          { create(:person) }
    let(:linked_account)  { create(:github_account, person: person) }

    let!(:tracker_plugin) do
      allow_any_instance_of(TrackerPlugin).to receive(:linked_account_can_write?).and_return(true)
      allow_any_instance_of(TrackerPlugin).to receive(:can_modify_repo?).and_return(true)

      create(:tracker_plugin, person: person)
    end

    let(:params) { { access_token: person.create_access_token } }

    # No longer routed to
    xit "should show tracker plugins" do
      get :tracker_plugins, params: params
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
      get :project_relations, params: params
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
      post :set_languages, params: params.merge(language_ids: [language1.id, language2.id].join(','))
      assert_response :ok

      person.reload
      expect(person.languages).to include language1
      expect(person.languages).to include language2
    end

    it "should remove languages" do
      person.set_languages(language1.id, language2.id)
      expect(person.languages).to include language1
      expect(person.languages).to include language2

      delete :set_languages, params: params.merge(language_ids: language2.id)
      assert_response :ok

      person.reload
      expect(person.languages).not_to include language1
      expect(person.languages).to include language2
    end
  end

  describe "report" do
    let(:reporter) { create(:person, email: "reporter@example.com", display_name: "Reporter") }
    let(:reported_person) { create(:person, email: "reported@example.com", display_name: "Reported") }
    let(:params) { { access_token: reporter.create_access_token, profile_id: reported_person.to_param } }

    it "emails support with the selected reason and comment" do
      expect {
        post :report, params: params.merge(reason: "spam", comment: "Suspicious links")
      }.to change(ActionMailer::Base.deliveries, :count).by(1)

      assert_response :ok

      email = ActionMailer::Base.deliveries.last
      expect(email.to).to eq(["support@bountysource.com"])
      expect(email.from).to eq([reporter.email])
      expect(email.reply_to).to eq([reporter.email])
      expect(email.subject).to eq("Profile reported: #{reported_person.display_name}")
      expect(email.encoded).to include("spam")
      expect(email.encoded).to include("Suspicious links")
      expect(email.encoded).to include(reported_person.to_param)
    end

    it "requires authentication" do
      post :report, params: params.except(:access_token).merge(reason: "spam")
      assert_response :unauthorized
    end

    it "rejects invalid reasons" do
      expect {
        post :report, params: params.merge(reason: "not-a-reason")
      }.not_to change(ActionMailer::Base.deliveries, :count)

      assert_response :unprocessable_entity
    end

    it "does not allow self reports" do
      expect {
        post :report, params: {
          access_token: reporter.create_access_token,
          profile_id: reporter.to_param,
          reason: "spam"
        }
      }.not_to change(ActionMailer::Base.deliveries, :count)

      assert_response :unprocessable_entity
    end
  end
end
