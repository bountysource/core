# == Schema Information
#
# Table name: trackers
#
#  id                   :integer          not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  remote_id            :integer
#  url                  :string           not null
#  name                 :string           not null
#  full_name            :string
#  is_fork              :boolean          default(FALSE)
#  watchers             :integer          default(0), not null
#  forks                :integer          default(0)
#  pushed_at            :datetime
#  description          :text
#  featured             :boolean          default(FALSE), not null
#  open_issues          :integer          default(0), not null
#  synced_at            :datetime
#  project_tax          :decimal(9, 4)    default(0.0)
#  has_issues           :boolean          default(TRUE), not null
#  has_wiki             :boolean          default(FALSE), not null
#  has_downloads        :boolean          default(FALSE), not null
#  private              :boolean          default(FALSE), not null
#  homepage             :string
#  sync_in_progress     :boolean          default(FALSE), not null
#  bounty_total         :decimal(10, 2)   default(0.0), not null
#  account_balance      :decimal(10, 2)   default(0.0)
#  type                 :string           default("Tracker"), not null
#  cloudinary_id        :string
#  closed_issues        :integer          default(0), not null
#  delta                :boolean          default(TRUE), not null
#  can_edit             :boolean          default(TRUE), not null
#  repo_url             :text
#  rank                 :integer          default(0), not null
#  remote_cloudinary_id :string
#  remote_name          :string
#  remote_description   :text
#  remote_homepage      :string
#  remote_language_ids  :integer          default([]), is an Array
#  language_ids         :integer          default([]), is an Array
#  team_id              :integer
#  deleted_at           :datetime
#
# Indexes
#
#  index_trackers_on_bounty_total   (bounty_total)
#  index_trackers_on_closed_issues  (closed_issues)
#  index_trackers_on_delta          (delta)
#  index_trackers_on_open_issues    (open_issues)
#  index_trackers_on_rank           (rank)
#  index_trackers_on_remote_id      (remote_id)
#  index_trackers_on_team_id        (team_id)
#  index_trackers_on_type           (type)
#  index_trackers_on_url            (url) UNIQUE
#  index_trackers_on_watchers       (watchers)
#

class Jira::Tracker < ::Tracker

  has_many :issues, class_name: "Jira::Issue", foreign_key: :tracker_id
  MAX_RESULT_PER_PAGE = 25

  # REMOTE SYNC INSTANCE METHODS
  def remote_sync_if_necessary(options={})
    if synced_at.nil?
      remote_sync(options)
    elsif synced_at < 1.hour.ago
      delay.remote_sync(options)
    end
  end

  def remote_sync(options={})
    update_attributes!(synced_at: Time.now)
    # update from API response, if data changed since last sync
    params = {
      jqlQuery: "project=#{self.url.split('/').last} AND resolution=Unresolved ORDER BY priority DESC", # only fetch open issues
      tempMax: MAX_RESULT_PER_PAGE
    }
    params['pager/start'] = options[:offset] if options[:offset]

    api_options = {
      url: Jira::API.generate_base_url(self.url),
      path: Jira::API.generate_issue_list_path(params)
    }
    api_response = Jira::API.fetch_issue_list(api_options)

    # create or update issues
    sync_issues_from_array(api_response[:issues])

    # if we don't have an explicit page, assume we're at the beginning and start loading all pages
    unless options[:offset]
      offset = MAX_RESULT_PER_PAGE
      while offset < api_response[:total_issues]
        (options[:force] ? self : delay).remote_sync(options.merge(offset: offset))
        offset += MAX_RESULT_PER_PAGE
      end
    end
  end

  # override full_sync... we don't need to get each issue individually beacuse JIRA gives us everything we need
  def full_sync
    remote_sync(force: true)
  end
end
