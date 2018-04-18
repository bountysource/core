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

class Github::Repository < Tracker
  # RELATIONSHIPS
  has_many :issues, class_name: 'Github::Issue', foreign_key: :tracker_id

  has_many :stargazers, class_name: 'GithubStargazer', foreign_key: :tracker_id, dependent: :delete_all

  # VALIDATIONS
  validates :url, format: { with: /\Ahttps:\/\/github\.com\/[^\/]+\/[^\/]+(\?.+)?\z/ix }
  validates :remote_id, presence: true, uniqueness: true

  class Error < StandardError ; end

  # first time it loads all issues, subsequent times just refreshes the repo itself
  def remote_sync_if_necessary(options={})
    return if ENV['DISABLE_GITHUB']

    if synced_at.nil? || deleted_at
      remote_sync(options)
    elsif synced_at < 15.minutes.ago
      delay.remote_sync(options)
    else
      # no syncing since we've sync'd within past minute
    end
  end

  def remote_sync(options={})
    return if ENV['DISABLE_GITHUB']
    previous_synced_at = options[:force] ? nil : self.synced_at
    update_from_github(options)
    find_or_create_issues_from_github({ since: previous_synced_at }.merge(options))

    # these really shouldn't change, so let's only update the very first time
    update_languages if previous_synced_at.nil?

    if deleted_at
      update_attributes(deleted_at: nil, url: url.partition("?deleted_at=").first)
      issues.each do |issue|
        issue.update_attributes(deleted_at: nil, url: issue.url.partition("?deleted_at=").first)
      end
    end
  rescue Github::API::NotFound
    unless deleted_at
      update_attributes(deleted_at: Time.now)
      issues.each do |issue|
        issue.update_attributes(deleted_at: Time.now)
      end
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
    # trigger an update on the underlying object if modified
    self.class.update_attributes_from_github_data(api_response.data, obj: self) if api_response.modified?
  end

  # Update the repo languages from GitHub
  def update_languages
    # Get existing repo languages from GitHub
    remote_languages = fetch_languages

    # Check Language table, add new ones if necessary
    remote_languages.each do |name, bytes|
      language = Language.find_or_create_by(name: name)

      # Create relation if needed
      language_relations.create(language: language, bytes: bytes)
    end

    # If a language was removed from remote repo, destroy the relation
    removed_languages = languages.pluck(:name) - remote_languages.keys
    removed_languages.each do |language_name|
      language = Language.where(name: language_name).first
      relation = language_relations.where(language_id: language.id).first
      relation.destroy
    end

    languages
  end

  # Get languages from github
  def fetch_languages
    response = ::Github::API.call(url: "/repos/#{full_name}/languages")
    response.success? or raise "#{self.class}(#{id}): Failed to fetch languages"
    response.data
  end

  def github_api_path
    "/repositories/#{remote_id}"
  end

  def self.has_full_name?
    true
  end

  def find_or_create_issues_from_github(options={})
    # don't bother unless we know this repo has issues
    return unless has_issues?

    # TODO: optimization: github api returns open_issues_count which we could compare to issues.where(state=open)

    if options[:state]
      # make a call to github API
      api_response = Github::API.call(
        url: File.join(self.github_api_path, "/issues"),
        params: {
          access_token: options[:person].try(:github_account).try(:oauth_token),
          since: options[:since].try(:iso8601),
          state: options[:state],
          page: options[:page] || 1
        }.reject { |k,v| v.nil? },

        # NOTE: this doesn't have any affect... and we don't want to store etags, so no API optimization here.
        #headers: {
        #  'If-Modified-Since' => options[:since].try(:httpdate)
        #}.reject { |k,v| v.nil? }
      )

      # Edge case: tracker is deleted, just raise for now
      if !api_response.success? && api_response.status == 404
        raise "Github::Repository(#{id}) not found at GitHub(#{url}). Maybe it was deleted?"
      end

      # process these 100 issues
      Github::Issue.update_attributes_from_github_array(api_response.data)

      # if a page param wasn't passed in, load the rest of the pages
      if !options[:page] && api_response.link[:last]
        # drops asynch messages for the rest of the issues up to last page
        last_page = Rack::Utils.parse_nested_query(api_response.link[:last].split('?').last)['page'].to_i
        (2..last_page).each do |page|
          (options[:force] ? self : delay).find_or_create_issues_from_github(options.merge(page: page))
        end
      end
    else
      # if no state was passed in, then we assume it means "all".  synchronous open and asynchronous closed
      find_or_create_issues_from_github(options.merge(state: 'open'))
      (options[:force] ? self : delay).find_or_create_issues_from_github(options.merge(state: 'closed'))
    end
  end

  def display_name
    full_name
  end

  def self.repos_for_org(org_name, access_token=nil)
    members = Github::API.call(url: "/orgs/#{org_name}/members", params: { access_token: access_token }).data
    member_trackers = repos_for_logins(members.map { |m| m['login'] }, access_token)

    # simple processing now, uniques per members
    tracker_uniques = {}
    member_trackers.each do |login, trackers|
      trackers.each do |tracker_url, weight|
        tracker_uniques[tracker_url] = (tracker_uniques[tracker_url]||0) + 1
      end
    end
    #tracker_uniques = tracker_uniques.reject { |k,v| v == 1 }
    tracker_uniques.to_a.sort_by(&:last).reverse
  end

  def self.issues_and_repositories_for_org(org_name, access_token=nil)
    members = Github::API.call(url: "/orgs/#{org_name}/members", params: { access_token: access_token, per_page: 100 }).data
    issues_and_repositories_for_logins(members.map { |m| m['login'] }, access_token)
  end

  def self.issues_and_repositories_for_logins(logins, access_token=nil)
    data = []

    EM.run do
      url_template = "https://api.github.com/users/%s/events?page=%d&client_id=#{Api::Application.config.github_api[:client_id]}&client_secret=#{Api::Application.config.github_api[:client_secret]}#{"&access_token=#{access_token}" if access_token}"
      urls = []
      logins.each do |login|
        (1..10).each do |page|
          urls << [login, url_template % [login, page]]
        end
      end

      issue_event_types = %w(IssuesEvent IssueCommentEvent)

      EM::Iterator.new(urls, 100).each(
        proc { |(login,url), iter|
          http = EventMachine::HttpRequest.new(url).get

          http.callback do |http|
            #puts http.response
            #puts http.headers.inspect
            #puts "#{login} - #{url}"

            JSON.parse(http.response).each do |event|
              event = event.with_indifferent_access

              unless issue_event_types.include?(event['type'])
                next
              end

              if event['payload']['action'] == 'closed'
                next
              end

              if DateTime.parse(event['created_at']) < 1.month.ago
                next
              end

              data << {
                issue: event['payload']['issue'],
                repository: event['repo']
              }
            end
            iter.next
          end

          http.errback do |http|
            pp "Failed!: #{url}"
            http.response
            iter.next
          end
        },
        proc { EM.stop }
      )
    end

    data
  end

  def self.repos_for_logins(logins, access_token=nil)
    member_trackers = {}
    EM.run do
      url_template = "https://api.github.com/users/%s/events?page=%d&client_id=#{Api::Application.config.github_api[:client_id]}&client_secret=#{Api::Application.config.github_api[:client_secret]}#{"&access_token=#{access_token}" if access_token}"
      urls = []
      logins.each do |login|
        (1..10).each do |page|
          urls << [login, url_template % [login, page]]
        end
      end

      EM::Iterator.new(urls, 40).each(
        proc { |(login,url), iter|
          http = EventMachine::HttpRequest.new(url).get
          http.callback do |http|
            #puts http.response
            #puts http.headers.inspect
            #puts "#{login} - #{url}"
            member_trackers[login] ||= {}
            JSON.parse(http.response).each do |event|
              next unless event['repo'] && event['repo']['url']
              next if DateTime.parse(event['created_at']) < 6.months.ago
              tracker_url = event['repo']['url'].gsub('api.github.com/repos/','github.com/')
              next if tracker_url == 'https://github.com//'
              member_trackers[login][tracker_url] = (member_trackers[login][tracker_url] || 0) + 1
            end
            iter.next
          end
          http.errback do |http|
            p "Failed: #{url} #{http.response}"
            iter.next
          end
        },
        proc { EM.stop }
      )
    end
    member_trackers
  end

  # Given a list of Tracker IDs, query GitHub for a list of people who satisfy one of the following:
  # 1. Have claimed a Bounty on this Tracker on Bountysource
  # 2. Have committed to or submitted a pull request to the Repository on GitHub.
  # 3. Have forked the Repository on GitHub.
  def self.prospective_developers(*tracker_ids)
    developers = []

    Tracker.where(id: tracker_ids).find_each do |tracker|
      basic_users = []

      # 2. Have committed to or submitted a pull request to the Repository on GitHub.
      tracker.get_contributors do |contributors|
        contributors.each do |contributor_data|
          basic_users << contributor_data
        end
      end

      # 3. Have forked the Repository on GitHub.
      tracker.get_forkers do |forkers|
        forkers.each do |forker_data|
          basic_users << forker_data
        end
      end

      # For each login from contributors and forkers, fetch user profile.
      # If the profile has a public email, add the user to the developer list.
      EventMachine.run do
        multi = EventMachine::MultiRequest.new

        # Don't make API calls more than once if user comes up in more than one of the Respositories
        basic_users.uniq! { |basic_user| basic_user['id'] }

        basic_users.each_with_index do |user_data,i|
          profile_uri = URI.parse("https://api.github.com/users/#{user_data['login']}")
          profile_uri.query = Api::Application.config.github_api.to_param
          multi.add("#{i}:profile", EventMachine::HttpRequest.new(profile_uri.to_s).get)

          orgs_uri = URI.parse(user_data['organizations_url'])
          orgs_uri.query = Api::Application.config.github_api.to_param
          multi.add("#{i}:organizations", EventMachine::HttpRequest.new(orgs_uri.to_s).get)
        end

        multi.callback {
          full_users = {}

          multi.responses[:callback].each do |(label,response)|
            case label
            when %r{(\d+):profile}
              (full_users[$1] ||= {}).merge!(JSON.parse(response.response))
            when %r{(\d+):organizations}
              (full_users[$1] ||= {}).merge!('organizations' => JSON.parse(response.response))
            end
          end

          developers += full_users.map { |_,data| data }

          EventMachine.stop
        }
      end
    end

    # Unique on email address. Keeps person_id if that was set
    # developers.uniq { |developer| developer[:profile]['id'] }
    developers
  end

  # Get contributor GitHub profiles as JSON
  def get_contributors(&block)
    contributors = []

    response = Github::API.call(url: "/repos/#{full_name}/contributors")

    if !response.success?
      yield(contributors)
    else
      # Only fetch person with certain number of commits?
      contributors += response.data

      if response.pages.count > 1
        EventMachine.run do
          multi = EventMachine::MultiRequest.new

          response.pages[1..-1].each_with_index do |next_page_url,i|
            multi.add(i, EventMachine::HttpRequest.new(next_page_url).get)
          end

          multi.callback {
            multi.responses[:callback].each do |(_,response)|
              contributors +=  JSON.parse(response.response)
            end

            yield(contributors)

            EventMachine.stop
          }
        end
      else
        yield(contributors)
      end
    end
  end

  # Get users who forked this GitHub repo as JSON
  def get_forkers(&block)
    forkers = []

    response = Github::API.call(url: "/repos/#{full_name}/forks")

    if !response.success?
      yield(forkers)
    else
      forkers += response.data.map { |data| data['owner'] }

      if response.pages.count > 1
        EventMachine.run do
          multi = EventMachine::MultiRequest.new

          response.pages[1..-1].each_with_index do |next_page_url,i|
            multi.add(i, EventMachine::HttpRequest.new(next_page_url).get)
          end

          multi.callback {
            multi.responses[:callback].each do |(_,response)|
              forkers += JSON.parse(response.response).map { |data| data['owner'] }
            end

            yield(forkers)

            EventMachine.stop
          }
        end
      else
        yield(forkers)
      end
    end
  end

  # Given a GitHub URL, load a Tracker object.
  # Returns nil if invalid URL.
  # First, tries to load Tracker from our database by URL. If that fails,
  # we make an API call to Github to create the Tracker
  def self.extract_from_url(url)
    regex = %r{\Ahttps://github\.com/([a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+)}
    full_name = url.present? && url.match(regex).try(:[], 1)

    if url.blank? || full_name.blank?
      # doesn't match the regex, not a repo, move along.
      nil
    elsif (tracker = Github::Repository.find_by_url("https://github.com/#{full_name}"))
      # matched by URL, hooray! quick return
      tracker
    elsif (api_response = Github::API.call(url: "/repos/#{full_name}")).success?
      update_attributes_from_github_data(api_response.data)
    end
  end

  def self.update_attributes_from_github_array(github_data)
    # bulk load all repos
    repo_hash = where("remote_id in (?)", github_data.map { |r| r['id'] }).inject({}) { |hash,obj| hash[obj.remote_id.to_i] = obj; hash }

    # bulk update linked accounts to save lots of lookups
    linked_accounts = LinkedAccount::Github.update_attributes_from_github_array(github_data.map { |issue| issue['owner'] }.uniq.compact)
    linked_accounts_hash = linked_accounts.inject({}) { |hash,obj| hash[obj.remote_id.to_i] = obj; hash }

    github_data.map do |issue_data|
      linked_account = linked_accounts_hash[issue_data['owner']['id'].to_i] if issue_data.has_key?('owner')
      update_attributes_from_github_data(issue_data, obj: (repo_hash[issue_data['id'].to_i] || new()), owner: linked_account)
    end
  end

  def self.update_attributes_from_github_data(github_data, options={})
    # ghosts from the past? GISTs?
    return nil if github_data.blank? || github_data['name'] == '/'

    remote_id = github_data['id']
    url = get_url_from_github_data(github_data)

    # Ensure that we have a URL and remote_id before doing anything else
    unless url && remote_id
      raise Error, "Required: 'remote_id' and 'url': #{github_data.inspect}"
    end

    # passed in, find by remote_id, or new
    obj = options[:obj] || where(remote_id: remote_id)[0] || new

    obj.remote_id = remote_id
    obj.url = url
    obj.remote_name = obj.name = obj.full_name = github_data['full_name'] || url.split('/').last(2).compact.join('/')
    obj.is_fork = github_data['fork'] if github_data.has_key?('fork')
    obj.pushed_at = github_data['pushed_at'] if github_data.has_key?('pushed_at')
    obj.watchers = github_data['watchers_count'] if github_data.has_key?('watchers_count')
    obj.forks = github_data['forks'] if github_data.has_key?('forks')
    obj.has_issues = github_data['has_issues'] if github_data.has_key?('has_issues')
    obj.has_wiki = github_data['has_wiki'] if github_data.has_key?('has_wiki')
    obj.has_downloads = github_data['has_downloads'] if github_data.has_key?('has_downloads')
    obj.private = github_data['private'] if github_data.has_key?('private')
    obj.open_issues = github_data['open_issues'] if github_data.has_key?('open_issues')

    if github_data.has_key?('description')
      obj.description = github_data['description'] if obj.description.blank? || (obj.description == obj.remote_description)
      obj.remote_description = github_data['description']
    end

    if github_data.has_key?('homepage')
      obj.homepage = github_data['homepage'] if obj.homepage.blank? || (obj.homepage == obj.remote_homepage)
      obj.remote_homepage = github_data['homepage']
    end

    # If the GitHub object has an owner with a gravatar ID, set `remote_cloudinary_id`
    if new_cloudinary_id = get_cloudinary_id_from_github_data(github_data)
      obj.cloudinary_id = new_cloudinary_id if obj.cloudinary_id.blank? || (obj.cloudinary_id == obj.remote_cloudinary_id)
      obj.remote_cloudinary_id = new_cloudinary_id
    end

    # Update single-table-inheritance type
    obj.type = 'Github::Repository'
    type_changed = obj.type_changed?

    # Store the owner
    tmp_owner = options[:owner]
    tmp_owner ||= LinkedAccount::Github.update_attributes_from_github_data(github_data['owner']) if github_data['owner']

    # auto-associate a tracker owned by a github org to the github org's taem
    if (tmp_owner.try(:team) || tmp_owner.is_a?(LinkedAccount::Github::Organization)) && !obj.team_id && obj.open_issues > 0
      if tmp_owner.team
        obj.team = tmp_owner.team
      else
        # auto-create a team for this github org
        slug = tmp_owner.login.downcase.gsub(/[^a-z0-9\-]/,'-')
        slug = "#{slug}-#{tmp_owner.id}" if Team.where(slug: slug).count > 0
        obj.team = tmp_owner.create_team!(
          slug: slug,
          name: (tmp_owner.first_name && !tmp_owner.first_name.blank? ? tmp_owner.first_name : tmp_owner.login),
          cloudinary_id: tmp_owner.cloudinary_id,
        )
      end

    # auto-associate a tracker owned by a github user to a new team
    elsif tmp_owner.is_a?(LinkedAccount::Github::User) && !obj.team_id && obj.open_issues > 0 && obj.watchers >= 100
      slug = [
        obj.full_name.split('/').last.downcase,
        obj.full_name.gsub('/','-').downcase,
        "#{obj.full_name.gsub('/','-')}-#{obj.try(:id) || Time.now.to_i}".downcase,
        "#{obj.full_name.gsub('/','-')}-#{Time.now.to_i}".downcase
      ].find { |tmp_slug| Team.where(slug: tmp_slug).count == 0 }

      obj.team = Team.create!(
        slug: slug,
        name: obj.full_name.split('/').last,
        bio: obj.description
      )
    end

    # Save if it changed
    obj.save! if obj.changed?

    if tmp_owner
      TrackerRelation::Owner.find_or_create_by(tracker_id: obj.id, linked_account_id: tmp_owner.id)
      TrackerRelation::Owner.where("tracker_id = ? and linked_account_id != ?", obj.id, tmp_owner.id).delete_all
    end

    # Reload object
    return type_changed ? Github::Repository.where(id: obj.id).first! : obj
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique, PG::UniqueViolation

    # if another tracker has the same URL, it's probably outdated
    if (trackers = Tracker.where("url = ? and remote_id != ?", obj.url, obj.remote_id)).length > 0
      trackers.update_all("url=concat(url,'?conflicted_at=#{Time.now.to_i}')")
      trackers.each { |t| t.delay.remote_sync }
      obj.save!
    end

  end

  # has the owner of the tracker issued a takedown for all repositories and issues?
  def takendown?
    @owner_linked_account_id ||= TrackerRelation::Owner.where(tracker_id: self.id).pluck(:linked_account_id).first
    @owner_linked_account_id && Takedown.linked_account_id_has_takedown?(@owner_linked_account_id)
  end

  def to_param
    takendown? ? "#{id}-removed" : super
  end

protected

  # Get Repository WWW URL from GitHub API data
  def self.get_url_from_github_data(github_data)
    if github_data.has_key?('html_url') || github_data.has_key?('url')
      github_data['html_url'] || github_data['url'].gsub('https://api.github.com/repos/', 'https://github.com/')
    end
  end

  def self.get_cloudinary_id_from_github_data(github_data)
    if github_data['owner'] && github_data['owner']['type'] == 'Organization' && github_data['owner']['gravatar_id']
      "gravatar/#{github_data['owner']['gravatar_id']}"
    end
  end

end
