require 'spec_helper'

describe Redmine::Issue do

  describe '.remote_sync' do
    let(:redmine_issue) { create(:redmine_issue) }
    let(:data) do
      {
        number: 123,
        title: 'title',
        state: 'open',
        priority: 'high',
        comments: []
      }
    end
    before do
      expect(Redmine::API).to receive(:fetch_issue).and_return(data)
    end
    it "should call api and set issue attributes as api returned" do
      expect(redmine_issue.remote_sync).to be_truthy
      expect(redmine_issue.title).to eq('title')
    end
  end
end
