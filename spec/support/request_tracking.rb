shared_examples_for "request tracking" do

  describe "the add_tracking method" do
    controller do
      def index
        render nothing: true
      end
    end

    let(:person) { double(:person, id: 123, :was_seen! => true, email: "foo@example.com", display_name: "Bart", first_name: "muni", last_name: "strike") }
    let(:access_token) { "abc" }

    before do
      ::NewRelic::Agent.stub(add_custom_parameters: nil)
    end

    describe "should track if" do
      it "the person's ID and auth token are valid" do
        Person.stub(:find_by_access_token).with(access_token).and_return(person)
        expect(NewRelic::Agent).to receive(:add_custom_parameters).with(person_id: person.id).once
        expect(NewRelic::Agent).to receive(:add_custom_parameters).with(access_token: access_token).once
        get :index, access_token: access_token
        expect(response).to be_success
      end

      it "the person's isn't found (bad token)" do
        Person.stub(:find_by).with(access_token: access_token).and_return(nil)
        expect(NewRelic::Agent).to receive(:add_custom_parameters).with(person_id: nil).once
        expect(NewRelic::Agent).to receive(:add_custom_parameters).with(access_token: access_token).once
        get :index, access_token: access_token
      end

      it "the auth token isn't present" do
        expect(NewRelic::Agent).to receive(:add_custom_parameters).with(person_id: nil).once
        expect(NewRelic::Agent).to receive(:add_custom_parameters).with(access_token: nil).once
        get :index
      end
    end

    it "should load the page in the token and person success case" do
      Person.stub(:find_by_access_token).with(access_token).and_return(person)
      get :index, access_token: access_token
      expect(response).to be_success
    end

    #TODO this should raise if there is no person - Julian
    it "should not raise if there is no person" do
      Person.stub(:find_by).with(access_token: access_token).and_return(nil)
      get :index, access_token: access_token
      expect(response).to be_success
    end

    #TODO this should raise when there is no auth token. - Julian
    it "should not raise if there is no auth token" do
      get :index
      expect(response).to be_success
    end

    it "should load the page even if the method explodes" do
      ::NewRelic::Agent.stub(:add_custom_parameters).and_raise(StandardError)
      get :index
      expect(response).to be_success
    end
  end
end
