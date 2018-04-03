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
        expect(result.count).to eq(1)
        issue_result = result.first
        expect(issue_result['id']).to eq(issue.id)
        expect(issue_result['title']).to eq(issue.title)

        # on issues index, we don't want RABL to include the tracker because we already know which tracker it is
        expect(issue_result['tracker']).to eq(nil)
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
          expect(result['number']).to eq(issue.number)
          expect(result['body_html']).to eq(issue.sanitized_body_html)
          expect(result['url']).to eq(issue.url)
        end

        it "should assign issue" do
          expect(assigns[:issue]).to eq(issue)
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
          expect_any_instance_of(Github::Issue).to receive(:remote_sync_if_necessary).and_return(true)
          get :show, params: { id: issue.to_param }
        end

        it "should render result" do
          expect(result['number']).to eq(issue.number)
          expect(result['body_html']).to eq(issue.sanitized_body_html)
          expect(result['url']).to eq(issue.url)
        end

        it "should assign issue" do
          expect(assigns[:issue]).to eq(issue)
        end
      end

      describe 'trac issue' do
        let(:tracker) { create(:trac_tracker, synced_at: Time.now) }
        let(:issue) { create(:trac_issue, tracker: tracker) }

        before do
          expect_any_instance_of(Trac::Issue).to receive(:remote_sync_if_necessary).and_return(true)
          get :show, params: { id: issue.to_param }
        end

        it "should render result" do
          expect(result['number']).to eq(issue.number)
          expect(result['body_html']).to eq(issue.sanitized_body_html)
          expect(result['url']).to eq(issue.url)
        end

        it "should assign issue" do
          expect(assigns[:issue]).to eq(issue)
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
        expect(assigns[:issue]).to be_nil
      end
    end
  end

  describe 'merged models' do

    let(:good_model) { create(:issue) }
    let(:bad_model) { create(:issue) }

    before { good_model.merge! bad_model }

    it 'should render good_model when bad_model requested' do
      get :show, params: { id: bad_model.id }
      expect(result['id']).to eq(good_model.id)
    end

  end

end
