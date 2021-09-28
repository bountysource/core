require 'spec_helper'

describe Redmine::Tracker do

  describe '.remote_sync' do
    let(:tracker) { create(:redmine_tracker) }
    let(:data) do
      [{
        number: 123,
        title: 'title',
        state: 'open',
        priority: 'high',
        url: "#{tracker.url}/issues/123"
      }]
    end
    before do
      expect(Redmine::API).to receive(:fetch_issue_list).and_return(data)
    end
    it "should call api and set issue attributes as api returned" do
      tracker.remote_sync
      expect(tracker.issues.count).to eq(1)
      issue = tracker.issues.first
      expect(issue.title).to eq('title')
    end
  end
end
