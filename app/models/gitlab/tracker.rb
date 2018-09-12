# == Schema Information
#
# Table name: trackers
#
#  id                   :integer          not null, primary key
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  remote_id            :integer
#  url                  :string(255)      not null
#  name                 :string(255)      not null
#  full_name            :string(255)
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
#  homepage             :string(255)
#  sync_in_progress     :boolean          default(FALSE), not null
#  bounty_total         :decimal(10, 2)   default(0.0), not null
#  account_balance      :decimal(10, 2)   default(0.0)
#  type                 :string(255)      default("Tracker"), not null
#  cloudinary_id        :string(255)
#  closed_issues        :integer          default(0), not null
#  delta                :boolean          default(TRUE), not null
#  can_edit             :boolean          default(TRUE), not null
#  repo_url             :text
#  rank                 :integer          default(0), not null
#  remote_cloudinary_id :string(255)
#  remote_name          :string(255)
#  remote_description   :text
#  remote_homepage      :string(255)
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

class Gitlab::Tracker < ::Tracker
  has_many :issues, class_name: "Gitlab::Issue", foreign_key: :tracker_id

  MAX_RESULT_PER_PAGE = 100

  def remote_sync_if_necessary(options={})
    if synced_at.nil?
      remote_sync(options)
    elsif synced_at < 1.week.ago
      delay.remote_sync(options)
    end
  end

  def remote_sync(options={})
    update_attributes!(synced_at: Time.now)
    previous_synced_at = options[:force] ? nil : self.synced_at
    update_tracker_attributes(options)

    find_or_create_issues_from_gitlab({ since: previous_synced_at }.merge(options))
  end

  def update_tracker_attributes(options={})
    if_modified_since = options[:force] ? nil : self.synced_at.try(:httpdate)
    update_attribute(:synced_at, Time.now)

    api_options = {
      url: Gitlab::API.generate_base_url(self)
    }
    api_response = Gitlab::API.fetch_tracker(api_options)
    return unless api_response
    self.update_attributes(api_response)
  end

  private
  def find_or_create_issues_from_gitlab(options={})
    # don't bother unless we know this repo has issues
    return unless has_issues?

    if options[:state]
      gitlab_state = options[:state] == 'open' ? 'opened' : 'closed'
      # make a call to github API
      api_options = {
        url: Gitlab::API.generate_base_url(self),
        path: Gitlab::API.generate_issue_list_path(
          { state: gitlab_state, page: options[:page], per_page: MAX_RESULT_PER_PAGE }
        )
      }

      api_response = Gitlab::API.fetch_issues(api_options)
      issues_data = api_response[:data]

      # process these 100 issues
      issues_data.each do |issue_data|
        issue = Gitlab::Issue.find_or_initialize_by(url: issue_data[:url])
        issue.tracker = self
        issue.update_data_from_json(issue_data)
      end

      # if a page param wasn't passed in, load the rest of the pages
      if !options[:page] && api_response[:total_pages]
        # drops asynch messages for the rest of the issues up to last page
        last_page = api_response[:total_pages]
        (2..last_page).each do |page|
          (options[:force] ? self : delay(priority: 75)).find_or_create_issues_from_gitlab(options.merge(page: page))
        end
      end
    else
      # if no state was passed in, then we assume it means "all".  synchronous open and asynchronous closed
      find_or_create_issues_from_gitlab(options.merge(state: 'open'))
      (options[:force] ? self : delay).find_or_create_issues_from_gitlab(options.merge(state: 'closed'))
    end
  end

end
