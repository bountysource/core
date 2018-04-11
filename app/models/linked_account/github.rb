# == Schema Information
#
# Table name: linked_accounts
#
#  id               :integer          not null, primary key
#  person_id        :integer
#  type             :string
#  uid              :integer
#  login            :string
#  first_name       :string
#  last_name        :string
#  email            :string
#  oauth_token      :string
#  oauth_secret     :string
#  permissions      :string
#  synced_at        :datetime
#  sync_in_progress :boolean          default(FALSE)
#  followers        :integer          default(0)
#  following        :integer          default(0)
#  created_at       :datetime
#  updated_at       :datetime
#  account_balance  :decimal(10, 2)   default(0.0)
#  anonymous        :boolean          default(FALSE), not null
#  company          :string
#  location         :string
#  bio              :text
#  cloudinary_id    :string
#  deleted_at       :datetime
#
# Indexes
#
#  index_linked_accounts_on_anonymous     (anonymous)
#  index_linked_accounts_on_email         (email)
#  index_linked_accounts_on_login         (login)
#  index_linked_accounts_on_person_id     (person_id)
#  index_linked_accounts_on_uid           (uid)
#  index_linked_accounts_on_uid_and_type  (uid,type) UNIQUE
#

class LinkedAccount::Github < LinkedAccount::Base

  has_many :issue_ranks, foreign_key: :linked_account_id, class_name: 'IssueRank::LinkedAccountGithub'

  has_one :team, foreign_key: :linked_account_id

  validates :uid, uniqueness: true, on: :create

  class GithubAccountLinkError < Exception ; end

  def self.oauth_url(options={})
    %(https://github.com/login/oauth/authorize?#{{
      client_id:  Api::Application.config.github_api[:client_id],
      scope:      options[:scope],
      # scope:      ((options[:scope]||'').split(',') + ['user:email','read:org']).join(','),
      state:      options[:state]
    }.reject { |k,v| v.nil? }.to_param})
  end

  def self.find_or_create_via_oauth_code(code)
    # hit github oauth server to exchange code for access_token
    oauth_response = ::Github::API.call(
      url: "/login/oauth/access_token",
      type: 'POST',
      host: "https://github.com", # manually override api.github.com
      params: {
        client_id:      Api::Application.config.github_api[:client_id],
        client_secret:  Api::Application.config.github_api[:client_secret],
        code:           code # provided from :login step. this is exchanged for an oauth token
      },
      headers: { 'Accept' => 'application/json' }
    )

    # if we got an error, raise!
    raise ::Github::API::Error, oauth_response.data[:error] unless oauth_response.success?

    # get user object from Github with oauth_token (full_response so we can pull out .scope)
    github_user_response = ::Github::API.call(
      url: '/user',
      params: { access_token: oauth_response.data[:access_token] }
    )
    github_user_data = github_user_response.data

    # TODO figure out what causes this instead of raising.
    unless github_user_response.success? && github_user_data.has_key?("login") && github_user_data.has_key?("id")
      raise GithubAccountLinkError, "Oh no! Something went wrong linking this github account! GO FIX IT"
    end

    # find/update of create a linked_account model
    linked_account = update_attributes_from_github_data(github_user_data)

    # update with oauth token and permissions
    linked_account.update_attributes(oauth_token: oauth_response.data[:access_token], permissions: github_user_response.scopes.join(","))

    # asynchronously find projects (since it's oauth, this is always a User, never a Organization)
    linked_account.sync_all_data_if_necessary

    linked_account
  end

  def self.find_by_access_token(access_token)
    github_account_id, time, hash = (access_token||'').split('.')
    return nil if github_account_id.blank? || time.blank? || hash.blank?
    return nil unless time.to_i > Time.now.to_i
    return nil unless (github_account = LinkedAccount::Github::User.find_by_id(github_account_id))
    return nil unless hash == self.hash_access_token(github_account, time)
    github_account
  end

  def create_access_token
    time = 1.day.from_now.to_i
    "#{self.id}.#{time}.#{self.class.hash_access_token(self, time)}"
  end

  def api(options={})
    options[:params] ||= {}
    options[:params].merge!(access_token: oauth_token) if !options[:params][:access_token] && oauth_token?
    ::Github::API.call(options)
  rescue ::Github::API::Unauthorized
    if oauth_token
      update_attributes!(oauth_token: nil)
      retry
    else
      raise
    end
  end

  # get remote user info from GitHub
  def remote_info
    return nil unless oauth_token?
    response = api(url: '/user')
    response.data
  end

  def remote_sync(options={})
    unless deleted_at
      github_data = api(url: self.github_api_path).data
      self.class.update_attributes_from_github_data(github_data, obj: self)
    end
  rescue ::Github::API::NotFound
    deleted_at = Time.now
    update_attributes!(deleted_at: deleted_at)
  end

  # array of logins for users that this account is following
  def following_logins
    return [] if oauth_token.blank?

    response = api(url: "/users/#{login}/following")

    if response.success?
      response.data.map { |d| d["login"] }
    else
      update_attributes(oauth_token: nil) and []
    end
  end

  def github_api_path
    "/user/#{remote_id}"
  end

  #def sync_permissions
  #  return [] unless oauth_token?
  #  response = api(url: '/', type: 'HEAD')
  #  response.scopes
  #end

  def has_permission?(permission)
    permissions.include? permission.to_s
  end

  # can this account modify the repository?
  def can_modify_repository?(tracker)
    response = api(url: "/repos/#{tracker.full_name}", type: 'PATCH', body: {})
    raise "Expected response to be NotFound or UnprocessableEntity (#{response.status})"
  rescue Github::API::UnprocessableEntity
    true
  rescue Github::API::Unauthorized
    false
  rescue Github::API::NotFound
    false
  end


  def fetch_events
    urls = (1..10).map do |i|
      path = case self
      when LinkedAccount::Github::User then "/users/#{login}/events"
      when LinkedAccount::Github::Organization then "/orgs/#{login}/events"
      end

      uri = URI.parse("https://api.github.com#{path}")
      uri.query = Api::Application.config.github_api.merge(page: i, per_page: 30).to_param
      uri.to_s
    end

    events = []
    EM.run {
      EM::Iterator.new(urls, 40).each(
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
    events
  end

  # increment IssueRank::LinkedAccountGithub for Team and Issue from GitHub user events.
  def sync_issue_ranks
    # Find or create rank from events, add value based on event
    IssueRank::LinkedAccountGithub.increment_rank_from_events(self, fetch_events)
  end

  def self.update_attributes_from_github_array(github_data)
    # bulk load all users
    rails_please_autoload = [LinkedAccount::Github::User, LinkedAccount::Github::Organization]
    user_hash = LinkedAccount::Github.where("uid in (?)", github_data.map { |user_data| user_data['id'] })
    user_hash = user_hash.inject({}) { |hash,obj| hash[obj.uid.to_i] = obj unless hash[obj.uid.to_i] && hash[obj.uid.to_i].id < obj.id; hash }

    github_data.map do |user_data|
      update_attributes_from_github_data(user_data, obj: (user_hash[user_data['id'].to_i] || LinkedAccount::Github.new()))
    end
  end

  def remote_id
    uid
  end

  def self.update_attributes_from_github_data(github_data, options={})
    return nil if github_data.blank? || github_data['url'] == "https://api.github.com/users/"
    raise "NO ID #{github_data.inspect}" unless remote_id = github_data['id']
    # Find object
    rails_please_autoload = [LinkedAccount::Github::User, LinkedAccount::Github::Organization]
    obj = options[:obj] || LinkedAccount::Github.where("uid = ?", remote_id)[0] || LinkedAccount::Github.new()

    obj.uid = remote_id
    obj.login = github_data['login'] if github_data.has_key?('login')
    obj.email = github_data['email'] if github_data.has_key?('email')
    obj.first_name = github_data['name'] if github_data.has_key?('name')
    obj.image_url = get_cloudinary_id_from_github_data(github_data)
    obj.company = github_data['company'] if github_data.has_key?('company')
    obj.location = github_data['location'] if github_data.has_key?('location')
    obj.bio = github_data['bio'] if github_data.has_key?('bio')
    obj.followers = github_data['followers'] if github_data.has_key?('followers')
    obj.following = github_data['following'] if github_data.has_key?('following')

    # sanitize email address
    unless obj.email.nil?
      # doesn't have an @ sign, can't be real
      obj.email = nil if !obj.email.try(:[], '@')

      # no github employees
      obj.email = nil if obj.email.try(:[], '@github.com')
      obj.email = nil if github_data['site_admin']
      obj.email = nil if github_data['company'].try(:match, /github/i)
    end

    # Update single-table-inheritance type
    # TODO not sure if URL is a good fallback to type, but it's probably fine 90% of the time.
    if github_data['type'] == 'Organization'
      obj.type = 'LinkedAccount::Github::Organization'
    elsif github_data['type'] == 'User'
      obj.type = 'LinkedAccount::Github::User'
    elsif github_data['type'] == 'Bot'
      obj.type = 'LinkedAccount::Github::Bot'
    else
      raise "Type not determined: #{github_data.inspect}"
    end

    type_was_changed = obj.type_changed?

    # Save if it changed
    obj.save! if obj.changed?

    type_was_changed ? obj.type.constantize.find_by(id: obj.id) : obj
  rescue ActiveRecord::RecordInvalid, PG::UniqueViolation, ActiveRecord::RecordNotUnique
    if options[:try_again]
      raise
    else
      # sometimes we can just try again......
      update_attributes_from_github_data(github_data, options.merge(try_again: true, obj: nil))
    end
  end

  # this and merge_and_destroy really shouldn't be necessary if things are working correctly............
  def self.find_and_merge_duplicates!(uids=nil)
    rails_please_autoload = [LinkedAccount::Github::User, LinkedAccount::Github::Organization]

    query = LinkedAccount::Github.group(:uid).having('count(*) > 1')
    query = query.where(uid: uids) if uids
    query.pluck(:uid).compact.each do |uid|
      accounts = LinkedAccount::Github.where(uid: uid).to_a

      good_account = accounts.find { |a| a.oauth_token }   #linked account
      good_account ||= accounts.find { |a| a.person_id }   #linked account
      good_account ||= accounts.sort_by(&:id).first        #first created
      bad_accounts = accounts - [good_account]

      LinkedAccount::Github.merge_and_destroy!(good_account.id, bad_accounts.map(&:id))

    end
  end

  #reload!; LinkedAccount::Github::User.merge_and_destroy!(LinkedAccount::Github::User.find(1092384), LinkedAccount::Github::User.find(1092383))
  def self.merge_and_destroy!(good_account_id, *bad_account_ids)
    bad_account_ids.flatten!
    bad_account_ids = bad_account_ids - [good_account_id]
    raise "no bad ids" if bad_account_ids.empty?

    good_account = LinkedAccount::Github.where(id: good_account_id).first
    bad_accounts = LinkedAccount::Github.where(id: bad_account_ids)


    puts "MERGING #{good_account.uid}: #{good_account_id} <-- #{bad_account_ids.inspect}"

    puts "BEFORE COUNTS: "
    puts "Comment: %d" % Comment.where(author_linked_account_id: bad_account_ids).count
    puts "Issue: %d" % Issue.where(author_linked_account_id: bad_account_ids).count
    puts "Team: %d" % Team.where(linked_account_id: bad_account_ids).count
    puts "IssueRank: %d" % IssueRank.where(linked_account_id: bad_account_ids).count
    puts "TrackerRelation: %d" % TrackerRelation.where(linked_account_id: bad_account_ids).count

    puts "MERGING:"
    puts "Comment: %d" % Comment.where(author_linked_account_id: bad_account_ids).update_all(author_linked_account_id: good_account_id)
    puts "Issue: %d" % Issue.where(author_linked_account_id: bad_account_ids).update_all(author_linked_account_id: good_account_id)
    puts "TrackerRelation: %d" % TrackerRelation.where(linked_account_id: bad_account_ids).delete_all
    puts "Team: %d" % Team.where(linked_account_id: bad_account_ids).update_all(linked_account_id: good_account_id)

    puts "AFTER COUNTS: "
    puts "Comment: %d" % Comment.where(author_linked_account_id: bad_account_ids).count
    puts "Issue: %d" % Issue.where(author_linked_account_id: bad_account_ids).count
    puts "Team: %d" % Team.where(linked_account_id: bad_account_ids).count
    puts "IssueRank: %d" % IssueRank.where(linked_account_id: bad_account_ids).count
    puts "TrackerRelation: %d" % TrackerRelation.where(linked_account_id: bad_account_ids).count

    if (Team.where(linked_account_id: bad_account_ids).count + IssueRank.where(linked_account_id: bad_account_ids).count + TrackerRelation.where(linked_account_id: bad_account_ids).count) == 0
    puts "DELETED: " % LinkedAccount::Github.where(id: bad_account_ids).delete_all
    else
      puts "NOT OKAY TO DELETE, SKIPPING"
    end
  end

protected

  def self.get_cloudinary_id_from_github_data(github_data)
    if github_data.has_key?('gravatar_id') && github_data['gravatar_id'].present?
      "gravatar:#{github_data['gravatar_id']}"
    elsif github_data.has_key?('avatar_url') && github_data['avatar_url'].present?
      "#{github_data['avatar_url']}"
    end
  end

  def self.hash_access_token(person, time)
    Digest::SHA1.hexdigest("#{person.id}.#{time}.#{Api::Application.config.linked_account_secret}")
  end

end
