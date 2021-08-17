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

# NOTE: this is only for one of the sourceforge trackers... they have another one as well
class SourceForgeNative::Tracker < ::Tracker

  has_many :issues, class_name: "SourceForgeNative::Issue", foreign_key: :tracker_id
  MAX_RESULT_PER_PAGE = 25
  # REMOTE SYNC INSTANCE METHODS
  def remote_sync_if_necessary(options={})
    if synced_at.nil?
      remote_sync(options={})
    elsif synced_at < 1.week.ago
      delay.remote_sync(options)
    end
  end

  def remote_sync(options={})
    update_attributes!(synced_at: Time.now)

    # which page to start on
    offset = options[:offset] || 0
    params = {
      limit: MAX_RESULT_PER_PAGE,
      offset: offset,
      status: 1, # only open issues
      tracker_url: self.url
    }

    # update from API response, if data changed since last sync
    # SourceForge list open ticket only by default, cheers!!
    results = SourceForgeNative::API.fetch_issue_list(
      url: "http://#{URI.parse(self.url).host}",
      path: SourceForgeNative::API.generate_issue_list_path(params)
    )

    sync_issues_from_array(results)

    # fetch next page if current page has full results
    (options[:force] ? self : delay).remote_sync(offset: offset+MAX_RESULT_PER_PAGE) if results.length == MAX_RESULT_PER_PAGE
  end
end
