# == Schema Information
#
# Table name: issues
#
#  id                       :integer          not null, primary key
#  github_pull_request_id   :integer
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  number                   :integer
#  url                      :string           not null
#  title                    :text
#  labels                   :string
#  code                     :boolean          default(FALSE)
#  state                    :string
#  body                     :text
#  remote_updated_at        :datetime
#  remote_id                :integer
#  tracker_id               :integer
#  solution_id              :integer
#  featured                 :boolean          default(FALSE), not null
#  remote_created_at        :datetime
#  synced_at                :datetime
#  comment_count            :integer          default(0)
#  sync_in_progress         :boolean          default(FALSE), not null
#  bounty_total             :decimal(10, 2)   default(0.0), not null
#  type                     :string           default("Issue"), not null
#  remote_type              :string
#  priority                 :string
#  milestone                :string
#  can_add_bounty           :boolean          default(FALSE), not null
#  accepted_bounty_claim_id :integer
#  author_name              :string
#  owner                    :string
#  paid_out                 :boolean          default(FALSE), not null
#  participants_count       :integer
#  thumbs_up_count          :integer
#  votes_count              :integer
#  watchers_count           :integer
#  severity                 :string
#  delta                    :boolean          default(TRUE), not null
#  author_linked_account_id :integer
#  solution_started         :boolean          default(FALSE), not null
#  body_markdown            :text
#  deleted_at               :datetime
#
# Indexes
#
#  index_issues_on_comment_count                  (comment_count)
#  index_issues_on_delta                          (delta)
#  index_issues_on_featured                       (featured)
#  index_issues_on_remote_id                      (remote_id)
#  index_issues_on_solution_started               (solution_started)
#  index_issues_on_tracker_id_and_bounty_total    (tracker_id,bounty_total)
#  index_issues_on_type                           (type)
#  index_issues_on_url                            (url) UNIQUE
#  index_issues_on_votes_count                    (votes_count)
#  index_issues_on_watchers_count                 (watchers_count)
#  index_issues_partial_author_linked_account_id  (author_linked_account_id)
#  index_issues_partial_bounty_total              (bounty_total)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count)
#

class Github::Issue < ::Issue
  # VALIDATIONS
  validates :number, presence: true
  validates :url, format: { with: /\Ahttps:\/\/github\.com\/[^\/]+\/[^\/]+\/(issues|pull)\/\d+(\?.+)?\z/ix }
  validates :remote_id, presence: true, uniqueness: true

  class Error < StandardError ; end

  # SYNCING INSTANCE METHODS
  def remote_sync_if_necessary(options={})
    return if ENV['DISABLE_GITHUB']

    if synced_at.nil? || deleted_at
      remote_sync(options)
    elsif synced_at < 1.minute.ago
      delay.remote_sync(options)
    else
      # no syncing since we've sync'd within past minute
    end
  end

  def remote_sync(options={})
    return if ENV['DISABLE_GITHUB']

    previous_synced_at = self.synced_at
    update_from_github(options)
    sync_comments

    if deleted_at
      update_attributes(deleted_at: nil, url: url.partition("?deleted_at=").first)
    end

    self
  rescue Github::API::NotFound
    unless deleted_at
	    deleted_at = Time.now
	    update_attributes(deleted_at: deleted_at, url: url + "?deleted_at=#{deleted_at.to_i}")
  	end
  end

  # INSTANCE METHODS
  def body_html
    GitHub::Markdown.render_gfm self.body
  end

  def update_title_on_original_tracker
    linked_account = tracker.plugin.linked_account
    linked_account.create_label(self)
  end

  # need to hit the API for the raw markdown source
  def get_raw_body(linked_account=nil)
    api = linked_account ? linked_account.method(:api) : ::Github::API.method(:call)

    response = api.call(
      url: "/repos/#{tracker.full_name}/issues/#{number}",
      headers: { 'Accept' => 'application/vnd.github.VERSION.raw' }
    )

    if response.success?
      response.data['body']
    else
      nil
    end
  end

  def body
    # add a class to github checkbox li's so that we can render checkboxes on frontend
    begin
      doc = Nokogiri::HTML.parse(super)
      doc.css("li.task-list-item").each do |li|
        if li.css("input[checked]").present?
          li['class'] = ((li['class'] || "").split(%r{\s+}) << "task-list-item-checked").join(" ")
        end
      end
      doc.to_html.match(%r{<body>(.*?)</body>}im)[1]
    rescue
      super
    end
  end

  def fetch_events
    response = Github::API.call(url: "/repos/#{tracker.full_name}/issues/#{number}/events")
    events = []
    if response.success?
      events += response.data

      if response.pages.count > 1
        EM.run {
          EM::Iterator.new(response.pages[1..-1], 40).each(
            proc { |url, iterator|
              http = EventMachine::HttpRequest.new(url).get

              http.callback { |http|
                events += JSON.parse(http.response)
                iterator.next
              }
            },

            proc { EM.stop }
          )
        }
      end
    end
    events
  end

  def self.extract_from_url(url)
    if url.blank? || !url.match(%r{\Ahttps://github\.com/([a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+)/(?:issues|pull)/(\d+)})
      # doesn't match the regex, not an issue, move along.
      nil
    elsif issue = (Github::Issue.find_by_url("https://github.com/#{$1}/issues/#{$2}") || Github::Issue.find_by_url("https://github.com/#{$1}/pull/#{$2}"))
      # matched by URL, hooray! quick return
      issue
    elsif (api_response = Github::API.call(url: "/repos/#{$1}/issues/#{$2}")).success?
      update_attributes_from_github_data(api_response.data)
    end
  end

  # make the actual API call and update the model. needs to be it's own method for message queueing
  def update_from_github(options={})
    # read synced_at before updating
    if_modified_since = options[:force] ? nil : self.synced_at.try(:httpdate)
    update_attribute(:synced_at, Time.now)

    # add access token
    params  = {
      access_token: options[:access_token] || options[:person].try(:github_account).try(:oauth_token)
    }.reject { |k,v| v.nil? }

    # update from API response, if data changed since last sync
    api_response = Github::API.call(
      url:            self.github_api_path,
      params:         params,
      headers:        { 'If-Modified-Since' => if_modified_since }
    )

    # trigger an update on the underlying object
    self.class.update_attributes_from_github_data(api_response.data, obj: self) 
  end

  # Sync comments with GitHub. Deletes comments that no longer exist.
  # We need to get all comments, each time, in order to deal with deleted comments.
  def sync_comments
    response = Github::API.call(url: "/repos/#{tracker.full_name}/issues/#{number}/comments", params: { page: 1 })
    response.success? or raise "#{self.class.name}(#{id}): Issue sync failed"

    github_data = response.data

    # Follow pagination to get all dem comments
    if response.pages.count > 1
      response.pages[1..-1].each do |next_page_url|
        next_page_response = Github::API.call(url: next_page_url)
        next_page_response.success? or raise "#{self.class.name}(#{id}: Issue sync failed"
        github_data += next_page_response.data
      end
    end

    current_comments = update_comments_from_github_array(github_data)

    # Remove deleted or duplicate comments... anything that's not in our comment_map from above
    comments.where("id not in (?)", current_comments.map(&:id)).delete_all

    update_comment_cache_counters
  end

  def update_comments_from_github_array(github_data)
    # bulk load all issues
    comment_hash = comments.where("remote_id in (?)", github_data.map { |r| r['id'] }).inject({}) { |hash,obj| hash[obj.remote_id.to_i] = obj; hash }

    # bulk update linked accounts to save lots of lookups
    linked_accounts = LinkedAccount::Github.update_attributes_from_github_array(github_data.map { |issue| issue['user'] }.uniq.compact)
    linked_accounts_hash = linked_accounts.inject({}) { |hash,obj| hash[obj.uid.to_i] = obj; hash }

    github_data.map do |comment_data|
      update_comments_from_github_data(
        comment_data,
        obj: (comment_hash[comment_data['id'].to_i] || comments.new()),
        issue: self,
        author: (linked_accounts_hash[comment_data['user']['id'].to_i] if comment_data.has_key?('user'))
      )
    end
  end

  def update_comments_from_github_data(github_data, options={})
    obj = options[:obj] || comments.where("remote_id = ?", github_data['id']).first_or_initialize

    obj.remote_id = github_data['id'].to_i

    if github_data.has_key?('body')
      obj.body_markdown = github_data['body']
      obj.body_html = nil
    elsif github_data.has_key?('body_html')
      obj.body_html = github_data['body_html']
    end

    obj.created_at = github_data['created_at'] if github_data.has_key?('created_at')
    obj.author = options[:author] || LinkedAccount::Github.update_attributes_from_github_data(github_data['user']) if options[:author] || github_data.has_key?('user')

    # save if it changed
    obj.save! if obj.changed?

    return obj
  end

  def github_api_path
    self.url.gsub('https://github.com/','/repos/').gsub('/pull/','/issues/')
  end

  def self.update_attributes_from_github_array(github_data, options={})
    # bulk load all issues
    issue_hash = where("remote_id in (?)", github_data.map { |r| r['id'] }).inject({}) { |hash,obj| hash[obj.remote_id.to_i] = obj; hash }


    # bulk update
    repos = Github::Repository.update_attributes_from_github_array(github_data.map { |issue| issue['repo'] }.uniq.compact)
    repos_hash = repos.inject({}) { |hash,obj| hash[obj.remote_id.to_i] = obj; hash }

    # bulk update linked accounts to save lots of lookups
    linked_accounts = LinkedAccount::Github.update_attributes_from_github_array(github_data.map { |issue| issue['user'] }.uniq.compact)
    linked_accounts_hash = linked_accounts.inject({}) { |hash,obj| hash[obj.remote_id.to_i] = obj; hash }

    github_data.map do |issue_data|
      update_attributes_from_github_data(
        issue_data,
        options.merge(
          obj: (issue_hash[issue_data['id'].to_i] || new()),
          author: (linked_accounts_hash[issue_data['user']['id'].to_i] if issue_data.has_key?('user')),
          tracker: (issue_data.has_key?('repo') ? repos_hash[issue_data['repo']['id'].to_i] : options[:tracker])
        )
      )
    end
  end

  def self.update_attributes_from_github_data(github_data, options={})
    raise "Pull_request data received instead of issue data (yes, they're different)." if github_data['issue_url']
    return nil if github_data.blank?

    remote_id = github_data['id']
    url = get_url_from_github_data(github_data)

    # Ensure that we have a URL and remote_id before doing anything else
    unless url && remote_id
      raise Error, "Issue id: #{options[:obj]&.id}. Required: 'remote_id' and 'url': #{github_data.inspect}"
    end

    # passed in, find by remote_id, or new
    obj = options[:obj] || where(remote_id: remote_id).first || new

    # set attributes
    obj.remote_id = remote_id
    obj.url = url
    obj.number = github_data['number'] if github_data.has_key?('number')
    obj.title = github_data['title'] if github_data.has_key?('title')

    if github_data.has_key?('body')
      obj.body_markdown = github_data['body']
      obj.body = nil

    elsif github_data.has_key?('body_html')
      obj.body = github_data['body_html']
    end

    obj.code = github_data['pull_request'] && !github_data['pull_request']['diff_url'].blank? if github_data.has_key?('pull_request')
    obj.remote_updated_at = github_data['updated_at'] if github_data.has_key?('updated_at')
    obj.remote_created_at = github_data['created_at'] if github_data.has_key?('created_at')
    obj.labels = github_data['labels'].map { |label| label['name'] }.join(',') if github_data.has_key?('labels')
    obj.comment_count = github_data['comments'] if github_data.has_key?('comments')
    obj.state = github_data['state'] if github_data.has_key?('state')
    obj.can_add_bounty = github_data['state'] == 'open' && !obj.code if github_data.has_key?('state')

    # If Issue Tracker is missing, load from options or find + sync from github_data.
    obj.tracker = options[:tracker]
    obj.tracker ||= Github::Repository.update_attributes_from_github_data(github_data['repo']) if github_data['repo']
    obj.tracker ||= Github::Repository.extract_from_url(obj.url)

    # If Issue author is missing, load from options or find + sync from github_data.
    obj.author = options[:author]
    obj.author ||= LinkedAccount::Github.update_attributes_from_github_data(github_data['user'])

    # update single-table-inheritance type
    obj.type = 'Github::Issue'
    type_changed = obj.type_changed?

    obj.dont_trigger_plugin_updates = true if options[:dont_trigger_plugin_updates]

    # save if it changed
    obj.save! if obj.changed?

    # reload object if type changed
    return type_changed ? Github::Issue.where(id: obj.id).first! : obj
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique, PG::UniqueViolation

    # if another issue has the same URL, it's probably outdated
    if (issues = Issue.where("url = ? and remote_id != ?", obj.url, obj.remote_id)).length > 0
      issues.update_all("url=concat(url,'?conflicted_at=#{Time.now.to_i}')")
      issues.each { |t| t.delay.remote_sync }
      obj.save!
    end

  end

protected

  def self.get_url_from_github_data(github_data)
    github_data['html_url'] if github_data.has_key?('html_url')
  end

end
