shared_examples_for "request tracking" do

  describe "the add_tracking method" do
    controller do
      def index
        head :ok
      end
    end

    let(:person) { double(:person, id: 123, :was_seen! => true, email: "foo@example.com", display_name: "Bart", first_name: "muni", last_name: "strike") }
    let(:access_token) { "abc" }

    before do
      ::NewRelic::Agent.stub(add_custom_attributes: nil)
    end

    describe "should track if" do
      it "the access_token finds a person" do
        Person.stub(:find_by_access_token).with(access_token).and_return(person)
        expect(NewRelic::Agent).to receive(:add_custom_attributes).with(person_id: person.id).once
        get :index, access_token: access_token
        expect(response).to be_success
      end

      it "the access_token doesn't find a person" do
        Person.stub(:find_by).with(access_token: access_token).and_return(nil)
        expect(NewRelic::Agent).to receive(:add_custom_attributes).with(person_id: nil).once
        get :index, access_token: access_token
      end

      it "the access_token isn't present" do
        expect(NewRelic::Agent).to receive(:add_custom_attributes).with(person_id: nil).once
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
      ::NewRelic::Agent.stub(:add_custom_attributes).and_raise(StandardError)
      get :index
      expect(response).to be_success
    end
  end
end
