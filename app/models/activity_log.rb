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

class ActivityLog < ActiveRecord::Base
  attr_accessible :issue, :tracker, :person, :name, :lurker

  validates :tracker_id, presence: true
  validates :name, presence: true

  belongs_to :person
  belongs_to :tracker
  belongs_to :issue
  belongs_to :lurker


  after_commit :update_caches

  def update_caches
    #if activity_log's person_id is nil, then it is anon record. Don't need to update tracker/issue caches
    return if self.person.nil?
    TrackerRankCache.update_cache(self)
    IssueRankCache.update_cache(self) if self.issue_id
  end


  #creates log event. if person nil, use remote_ip so save to anon table
  def self.log(name, request_info, options = {})
    person = Person.find_by_id(options[:person_id])
    tracker = Tracker.find_by_id(options[:tracker_id])
    issue = Issue.find_by_id(options[:issue_id])
    
    #for authenticated users, save in ActivityLog table
    if person
      ActivityLog.create!(
        name: name,
        issue: issue,
        tracker: tracker,
        person: person
      )
    elsif request_info["HTTP_USER_AGENT"].match(/\(.*https?:\/\/.*\)/)
      #Its a bot. Don't record any activity
    else
      # NOTE: first_or_create isn't atomic and wrapping in a transaction doesn't seem to help... so this, is the long way
      # lurker = Lurker.where(remote_ip: request_info["remote_ip"], user_agent: request_info["HTTP_USER_AGENT"]).first_or_create
      query = Lurker.where(remote_ip: request_info["remote_ip"], user_agent: request_info["HTTP_USER_AGENT"])
      lurker = query.first || (query.create! rescue query.first!)

      ActivityLog.create!(
        name: name,
        issue: issue,
        tracker: tracker,
        lurker: lurker
      ) if lurker
    end
  end

end
