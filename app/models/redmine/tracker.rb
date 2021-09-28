class Redmine::Tracker < ::Tracker
  has_many :issues, class_name: "Redmine::Issue", foreign_key: :tracker_id

  def remote_sync_if_necessary(options={})
    if synced_at.nil?
      remote_sync(options)
    elsif synced_at < 1.hour.ago
      delay.remote_sync(options)
    end
  end

  def remote_sync(options={})
    update_attributes synced_at: Time.now
    params = {
      sort: 'priority:desc,id:desc',
      v: { status_id: [1, 2, 8, 9, 11] },
      per_page: 100
    }
    api_options = {
      url: Redmine::API.generate_base_url(self.url),
      path: Redmine::API.generate_issue_list_path(params)
    }
    api_response = Redmine::API.fetch_issue_list(api_options)
    sync_issues_from_array(api_response)
  end
end
