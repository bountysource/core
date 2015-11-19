# == Schema Information
#
# Table name: tracker_plugins
#
#  id                    :integer          not null, primary key
#  tracker_id            :integer          not null
#  modify_title          :boolean          default(FALSE), not null
#  add_label             :boolean          default(FALSE), not null
#  modify_body           :boolean          default(FALSE), not null
#  synced_at             :datetime
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  label_name            :string(255)      default("bounty"), not null
#  type                  :string(255)
#  person_id             :integer
#  bounties_accepted_msg :string(255)
#  bounty_available_msg  :string(255)
#  bounty_claimed_msg    :string(255)
#  label_color           :string(255)      default("#129e5e"), not null
#  locked                :boolean          default(FALSE), not null
#  last_error            :text
#  locked_at             :datetime
#
# Indexes
#
#  index_tracker_plugins_on_add_label   (add_label)
#  index_tracker_plugins_on_person_id   (person_id)
#  index_tracker_plugins_on_synced_at   (synced_at)
#  index_tracker_plugins_on_tracker_id  (tracker_id) UNIQUE
#

# ruby breaks when trying to use TrackerPlugin::Github, because Github is a top-level constant.
class TrackerPlugin::GH < TrackerPlugin

  # number_to_dollars helper
  include NumberToDollarsHelper

  class InsufficientPermissions < StandardError ; end
  class UnknownError < StandardError ; end

  has_one :linked_account, through: :person, source: :github_account

  validates :label_color, presence: true, format: { with: /\A#[a-f0-9]{6}\z/ }
  validates :label_name, presence: true

  delegate :api, to: :linked_account

  # after plugin is intially created, trigger full update
  after_create do
    delay.update_issues
  end

  # update the label in github
  before_update do
    if label_color_changed? || label_name_changed?
      begin
        old_label = self.class.sanitize_label(label_name_was)
        response = api(url: "/repos/#{tracker.full_name}/labels/#{old_label}", type: "PATCH", body: { name: label_name, color: sanitized_label_color })
        return true
      rescue Github::API::Unauthorized
        # oauth token expired
        # NOTE: usually oauth_token gets set to nil, but before_update is in a transaction, so it gets rolled back.
        errors.add(:label, "cannot be modified with an invalid oauth token.")
        return false
      rescue Github::API::UnprocessableEntity => e
        # new name already taken
        errors.add(:label, "conflicts with an existing label on GitHub")
        return false
      rescue Github::API::NotFound => e
        # two possibilities... insufficent permissions... or the previous label wasn't found, so try creating it
        begin
          response = api(url: "/repos/#{tracker.full_name}/labels", type: "POST", body: { name: label_name, color: sanitized_label_color })
          return true
        rescue Github::API::UnprocessableEntity => e
          # this means they renamed it at github already... guess we don't have to do anything
          return true
        rescue Github::API::NotFound => e
          # okay, it's really insufficient permissions now
          errors.add(:label, "cannot be modified without additional permissions.")
          return false
        end
      end
    end
  end

  # if the title/body/label changed, trigger a full update
  after_update do
    if modify_title_changed? || modify_body_changed? || add_label_changed? || (locked_at_changed? && !locked_at)
      delay.update_issues
    end
  end

  # updates all issues unless a hash with :issue=>Issue or :issues=>[Issue,Issue] is passed in.
  def update_issues(options={})
    # if the plugin is locked, silently do nothing at all
    return if locked_at?

    if options[:issue]
      update_single_issue(options[:issue])
    elsif options[:issues]
      options[:issues].each { |issue| update_single_issue(issue) }
    else
      # all open issues
      update_all_issues

      # update closed issues that had bounties (1-by-1 is better than looking at 1000's of closed issues)
      closed_bountied_issue_ids = Issue.not_deleted.closed.where(tracker_id: self.tracker_id).joins(:bounties).pluck('distinct issues.id')
      Issue.where(id: closed_bountied_issue_ids).each { |issue| update_single_issue(issue) }
    end

    update_attributes(synced_at: Time.now)
  rescue Github::API::RateLimitExceeded
    # hrm, well that sucks. let's try again in 5 minutes...
    delay(run_at: 5.minutes.from_now).update_issues(options)
  rescue Github::API::Unauthorized
    # if the oauth token we have for them is no longer valid at all
    update_attributes!(locked_at: Time.now, last_error: "Invalid oauth token")
  rescue InsufficientPermissions => e
    update_attributes!(locked_at: Time.now, last_error: e.message)
  rescue UnknownError => e
    update_attributes!(locked_at: Time.now, last_error: e.message)
  # rescue Github::API::UnprocessableEntity
  #   # bad issue?
  # rescue Github::API::NotFound
  #   # issue no longer exists??
  rescue => e
    # default catch all
    update_attributes!(locked_at: Time.now, last_error: e.message)
  end

  def self.title_without_plugin(issue)
    issue.title.try(:gsub, / \[\$[0-9,]+?( awarded)?\]\Z/, '')
  end

  def self.body_without_plugin(issue)
    issue.body_markdown.blank? ? issue.body_markdown : issue.body_markdown.gsub(/(\r\n\r\n)?<bountysource-plugin>[\s\S]*?<\/bountysource-plugin>[\r\n]*?\Z/, '')
  end

  def self.sanitize_label(name)
    Rack::Utils.escape(name)
  end

protected

  def sanitized_label_name
    self.class.sanitize_label(label_name)
  end

  def sanitized_label_color
    label_color.gsub(/\A#/,'')
  end

  def update_single_issue(issue)
    # hit API and get hash for this single issue
    raise UnknownError, "Issue number missing (#{issue.id})" unless issue.number
    raise UnknownError, "Tracker doesn't match" unless issue.tracker_id == tracker.id
    response = api(url: File.join(tracker.github_api_path, "issues/#{issue.number}"))
    issue_json = response.data
    raise UnknownError, "API call failed" unless response.success?
    raise UnknownError, "Issue number doesn't match (#{issue_json['number']} != #{issue.number})" unless issue_json['number'] == issue.number

    # update issues based on data currently in github and load the most recent objects
    issue = Github::Issue.update_attributes_from_github_data(issue_json, tracker: tracker, dont_trigger_plugin_updates: true)

    # update
    update_issue_with_json(issue, issue_json)
  end

  def update_all_issues
    processed_issue_ids = []
    # loop through all issues ("updated" to maintain github order)
    options = { state: 'open', page: 1, sort: 'updated', direction: 'asc', per_page: 100 }
    while true
      # get next 100 from API
      api_response = api(url: File.join(tracker.github_api_path, "issues"), params: options)
      raise UnknownError, "API call failed" unless api_response.success?

      # if no response, return
      break if api_response.data.length == 0

      # update issues based on data currently in github and load the most recent objects
      issues = Github::Issue.update_attributes_from_github_array(api_response.data, tracker: tracker, dont_trigger_plugin_updates: true)

      raise UnknownError, "First and last issue have same since date, endless loop!" if (issues.first['updated_at'] == issues.last['updated_at']) && (api_response.data.length == options[:per_page])

      # process each issue
      api_response.data.each do |issue_json|
        issue = issues.find { |i| i.remote_id == issue_json['id'] }
        raise UnknownError, "Issue missing: #{issue_json['id']}" unless issue
        unless processed_issue_ids.include?(issue.id)
          update_issue_with_json(issue, issue_json)
          processed_issue_ids.push(issue.id)
        end
      end

      # next loop starts where this loop ends
      options[:since] = api_response.data.last['updated_at'] #already a string in .iso8601 format

      # break if we're at the end of the list
      break if api_response.data.length != options[:per_page]

      # TODO - OPTIMIZATION if we're updating 100's of issues, we'll end up looping through them twice here because they
      #        get added to the end of the updated_at queue... if we find the very first issue we update in this batch,
      #        then we should be able to stop looking because we successfully made it through. this would save
      #        N/100 API calls (1000 issues? this saves 10 api calls)
    end
  end

  def update_issue_with_json(issue, issue_json)
    raise UnknownError, "Producution environment required" unless Rails.env.production?

    #puts "#{issue_json['updated_at']} -- #{issue_json['url']}"

    raise UnknownError, "Title doesn't match" unless issue.title == issue_json['title']
    raise UnknownError, "Body doesn't match" unless issue.body_markdown == issue_json['body']

    # logic shortcuts
    is_open = issue.can_add_bounty?
    has_label = issue_json['labels'].find { |label| label['name'] == label_name }
    unclaimed_bounties = issue.bounties.active.sum(:amount)
    claimed_bounties = issue.bounties.paid.sum(:amount)
    total_bounties = unclaimed_bounties + claimed_bounties  # saves a DB call instead of issue.bounties.not_refunded.sum(:amount)

    # compute desired title
    if modify_title? && unclaimed_bounties > 0
      desired_title = "#{self.class.title_without_plugin(issue)} [#{number_to_dollars(unclaimed_bounties)}]"
    elsif modify_title? && claimed_bounties > 0
      desired_title = "#{self.class.title_without_plugin(issue)} [#{number_to_dollars(claimed_bounties)} awarded]"
    else
      desired_title = self.class.title_without_plugin(issue)
    end

    # url shortcuts
    utm = { utm_source: "github", utm_medium: "issues", utm_content: "tracker/#{issue.tracker_id}", utm_campaign: "plugin" }
    issue_url = "#{Api::Application.config.www_url}issues/#{issue.to_param}?#{utm.to_param}"
    bountysource_url = "#{Api::Application.config.www_url}?#{utm.to_param}"

    # compute desired body
    desired_body = self.class.body_without_plugin(issue)
    if !modify_body?
      plugin_text = nil
    elsif is_open && unclaimed_bounties > 0
      plugin_text = %(There is a **[#{number_to_dollars(unclaimed_bounties)} open bounty](#{issue_url})** on this issue. Add to the bounty at [Bountysource](#{bountysource_url}).)
    elsif is_open && unclaimed_bounties == 0
      plugin_text = %(Want to back this issue? **[Post a bounty on it!](#{issue_url})** We accept bounties via [Bountysource](#{bountysource_url}).)
    elsif !is_open && unclaimed_bounties > 0
      plugin_text = %(Did you help close this issue? Go claim the **[#{number_to_dollars(unclaimed_bounties)} bounty](#{issue_url})** on [Bountysource](#{bountysource_url}).)
    elsif !is_open && claimed_bounties > 0
      plugin_text = %(The **[#{number_to_dollars(claimed_bounties)} bounty](#{issue_url})** on this issue has been claimed at [Bountysource](#{bountysource_url}).)
    else
      plugin_text = nil
    end
    desired_body = "#{desired_body}\r\n\r\n<bountysource-plugin>\r\n---\r\n#{plugin_text}\r\n</bountysource-plugin>" if plugin_text

    # update API with title and body
    updates = {}
    updates[:title] = desired_title if issue.title != desired_title
    updates[:body] = desired_body if issue.body_markdown != desired_body && desired_body.to_s.length <= Api::Application.config.github.max_body_length
    unless updates.empty?
      update_response = api(url: "/repos/#{tracker.full_name}/issues/#{issue.number}", type: "PATCH", body: updates)
      raise UnknownError, "Failed to update issue " unless update_response.success?
      issue_json = update_response.data
      Github::Issue.update_attributes_from_github_data(issue_json, tracker: tracker, dont_trigger_plugin_updates: true)
    end

    # add or remove labels
    if !has_label && add_label? && total_bounties > 0
      retried_after_label_create = false
      label_response = api(url: "/repos/#{tracker.full_name}/issues/#{issue.number}/labels", type: "POST", body: [label_name])
      raise UnknownError, "Failed to add label" unless label_response.success?
      label_json = label_response.data

      # if label is wrong color, update it (we may have just created it)
      label = label_json.find { |label| label['name'] == label_name }
      if label['color'] != sanitized_label_color
        api(url: "/repos/#{tracker.full_name}/labels/#{sanitized_label_name}", type: "PATCH", body: { color: sanitized_label_color })
        raise UnknownError, "Failed to update label" unless label_response.success?
      end
    elsif has_label && (!add_label? || total_bounties == 0)
      label_response = api(url: "/repos/#{tracker.full_name}/issues/#{issue.number}/labels/#{sanitized_label_name}", type: "DELETE")
      raise UnknownError, "Failed to remove label" unless label_response.success?
    end
  rescue Github::API::NotFound => e
    # github returns 404's rather than a different code for bad issue updates.
    # it's okay to catch this and respond because we're only doing data-puts in this method because
    # all the GETs where an actual 404 might occur happen in update_single_issue or update_all_issues
    raise InsufficientPermissions, "Insufficient permissions to update #{tracker.full_name}/issues/#{issue.number}"
  end

end
