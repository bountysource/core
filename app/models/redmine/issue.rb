class Redmine::Issue < ::Issue
  belongs_to :tracker, class_name: 'Redmine::Tracker', foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    remote_sync(options) if synced_at.nil? || synced_at < 1.day.ago
  end

  def remote_sync(options={})
    update_attributes!(synced_at: Time.now) unless new_record?
    api_response = Redmine::API.fetch_issue(url: self.url)

    ApplicationRecord.transaction do
      comments_info = api_response.delete(:comments)
      api_response.merge!(synced_at: Time.now)
      update_attributes!(api_response)
      sync_comments_from_array(comments_info)
    end
  end
end
