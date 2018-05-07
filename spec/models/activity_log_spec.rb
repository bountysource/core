# == Schema Information
#
# Table name: activity_logs
#
#  id         :integer          not null, primary key
#  person_id  :integer
#  issue_id   :integer
#  tracker_id :integer          not null
#  name       :string(255)      not null
#  created_at :datetime         not null
#  lurker_id  :integer
#
# Indexes
#
#  index_activity_logs_on_created_at  (created_at)
#

require 'spec_helper'

describe ActivityLog do
  let(:person) { create :person }
  let(:tracker)  { create :tracker }
  let(:issue) { create :issue, tracker: tracker }
  let(:lurker) { create :lurker }
  
  let(:options) do
    {
      person_id: person.id,
      tracker_id: tracker.id,
      issue_id: issue.id
    }
  end

  let(:name) { "view" }
  
  let(:request_info) do
    {
      "HTTP_USER_AGENT" => "Foo",
      "remote_ip" => "127.0.1.42"
    }
  end

  let(:lurker_request_info) do
    {
      "HTTP_USER_AGENT" => lurker.user_agent,
      "remote_ip" => lurker.remote_ip
    }
  end

  describe "#self.log" do
    context "with a person access token" do
      it "should create a new activity log" do
        expect {
          ActivityLog.log(name, request_info, options)
        }.to change(ActivityLog, :count).by 1
      end
    end

    context "with a robot for the USER AGENT" do
      it "should not create an activity log" do
        options.delete(:person_id)
        request_info.merge!({"HTTP_USER_AGENT" => "(http://www.google.com)"})
        expect {
          ActivityLog.log(name, request_info, options)
        }.not_to change(ActivityLog, :count)
      end
    end

    context "with a new anonymous user" do
      it "should create a new lurker object" do
        options.delete(:person_id)
        expect {
          ActivityLog.log(name, request_info, options)
        }.to change(Lurker, :count).by 1
      end

      it "should create a activity log" do
        options.delete(:person_id)
        expect {
          ActivityLog.log(name, request_info, options)
        }.to change(ActivityLog, :count).by 1
      end
    end

    context "with an existing Lurker record" do
      it "should create a new activity log for that Lurker" do
        options.delete(:person_id)
        expect {
          ActivityLog.log(name, lurker_request_info, options)
        }.to change(ActivityLog, :count).by 1
        expect(ActivityLog.first.lurker.remote_ip).to eq("193.253.1.2")
      end

      it "should NOT create a new Lurker record" do
        options.delete(:person_id)
        lurker #initialize lurker object before testing method
        expect {
          ActivityLog.log(name, lurker_request_info, options)
        }.not_to change(Lurker, :count)
      end
    end
  end
end
