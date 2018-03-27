require 'spec_helper'

describe Api::V1::IssuesController do
  render_views

  let(:result) { JSON.parse(response.body) } #helper
  let!(:tracker) { create(:tracker, name: 'some project', url: 'http://www.abc.com/', synced_at: Time.now) }
  let!(:issue) { create(:issue, tracker: tracker, synced_at: Time.now) }

  describe '#index' do
    describe 'valid repo' do
      before do
        get :index, params: { tracker_id: tracker.to_param }
      end

      it "should render result" do
        result.count.should == 1
        issue_result = result.first
        issue_result['id'].should == issue.id
        issue_result['title'].should == issue.title

        # on issues index, we don't want RABL to include the tracker because we already know which tracker it is
        issue_result['tracker'].should == nil
      end
    end
  end

  describe '#show' do
    describe 'valid repo' do
      describe 'generic issue' do
        before do
          get :show, params: { id: issue.to_param }
        end

        it "should render result" do
          result['number'].should == issue.number
          result['body_html'].should == issue.sanitized_body_html
          result['url'].should == issue.url
        end

        it "should assign issue" do
          assigns[:issue].should == issue
        end
      end

      describe "activity log" do
        let(:person) { create :person }

        it "should create an activity log" do
          expect {
            get :show, params: { id: issue.to_param, access_token: person.create_access_token }
          }.to change(ActivityLog, :count).by 1
        end
      end

      describe 'github issue' do
        let(:issue) { create(:github_issue, tracker: tracker) }

        before do
          Github::Issue.any_instance.should_receive(:remote_sync_if_necessary).and_return(true)
          get :show, params: { id: issue.to_param }
        end

        it "should render result" do
          result['number'].should be == issue.number
          result['body_html'].should be == issue.sanitized_body_html
          result['url'].should be == issue.url
        end

        it "should assign issue" do
          assigns[:issue].should == issue
        end
      end

      describe 'trac issue' do
        let(:tracker) { create(:trac_tracker, synced_at: Time.now) }
        let(:issue) { create(:trac_issue, tracker: tracker) }

        before do
          Trac::Issue.any_instance.should_receive(:remote_sync_if_necessary).and_return(true)
          get :show, params: { id: issue.to_param }
        end

        it "should render result" do
          result['number'].should == issue.number
          result['body_html'].should == issue.sanitized_body_html
          result['url'].should == issue.url
        end

        it "should assign issue" do
          assigns[:issue].should == issue
        end
      end
    end

    describe 'invalid issue' do
      before do
        get :show, params: { id: 'badness' }
      end

      it "should render error" do
        assert_response :not_found
      end

      it "should not assign issue" do
        assigns[:issue].should be_nil
      end
    end
  end

  describe 'merged models' do

    let(:good_model) { create(:issue) }
    let(:bad_model) { create(:issue) }

    before { good_model.merge! bad_model }

    it 'should render good_model when bad_model requested' do
      get :show, params: { id: bad_model.id }
      result['id'].should be == good_model.id
    end

  end

end
