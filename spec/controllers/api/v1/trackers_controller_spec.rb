require 'spec_helper'

describe Api::V1::TrackersController do
  render_views

  let!(:repository) { create(:tracker, name: 'some other project', url: 'http://www.abc.com/') }

  let(:person) { create(:person) }

  describe '#show' do

    let(:result) { JSON.parse(response.body) }
    describe 'valid repo' do
      before do
        get :show, id: repository.id
      end

      it "should render result" do
        result['url'].should == repository.url
      end

      it "should assign repository" do
        assigns[:tracker].should == repository
      end
    end

    describe 'invalid repo' do
      before do
        get :show, id: 'invalid'
      end

      it "should render error" do
        assert_response :not_found
      end

      it "should not assign repository" do
        assigns[:tracker].should be_nil
      end
    end

    it "should create a tracker-view activity_log" do
      params = {
        id: repository.id,
        access_token: person.create_access_token
      }
      expect {
        get :show, params
      }.to change(ActivityLog, :count).by 1
    end

  end

  describe 'merged models' do

    let(:good_model) { create(:tracker) }
    let(:bad_model) { create(:tracker) }
    let(:result) { JSON.parse(response.body) }

    before { good_model.merge! bad_model }

    it 'should render good_model when bad_model requested' do
      get :show, id: bad_model.id
      result['id'].should be == good_model.id
    end

  end

end
