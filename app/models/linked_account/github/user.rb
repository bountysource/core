# == Schema Information
#
# Table name: linked_accounts
#
#  id               :integer          not null, primary key
#  person_id        :integer
#  type             :string(255)
#  uid              :integer
#  login            :string(255)
#  first_name       :string(255)
#  last_name        :string(255)
#  email            :string(255)
#  oauth_token      :string(255)
#  oauth_secret     :string(255)
#  permissions      :string(255)
#  synced_at        :datetime
#  sync_in_progress :boolean          default(FALSE)
#  followers        :integer          default(0)
#  following        :integer          default(0)
#  created_at       :datetime
#  updated_at       :datetime
#  account_balance  :decimal(10, 2)   default(0.0)
#  anonymous        :boolean          default(FALSE), not null
#  company          :string(255)
#  location         :string(255)
#  bio              :text
#  cloudinary_id    :string(255)
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

class LinkedAccount::Github::User < LinkedAccount::Github

  def self.find_or_create_from_github_response(attrs)
    sanitized_attributes = sanitize_attributes(attrs)
    account = where(uid: sanitized_attributes[:uid]).first
    account ||= create!(sanitized_attributes)
  end

  def self.sanitize_attributes(attrs)
    attrs = attrs.with_indifferent_access
    {
      uid: attrs['id'],
      login: attrs['login'],
      image_url: attrs['avatar_url']
    }
  end

  def after_link_with_person(person)
    sync_all_data_if_necessary
  end

  def synced?
    synced_at && (synced_at >= 1.day.ago) && !sync_in_progress
  end

  def sync_basic_data_if_necessary
    sync_basic_data unless synced_at
  end

  def sync_basic_data(options={})
    update_attributes(synced_at: Time.now)
    response = api(url: github_api_path, params: { access_token: options[:oauth_token] })
    self.class.update_attributes_from_github_data(response.data, obj: self)
  end

  def sync_all_data_if_necessary
    return if ENV['DISABLE_GITHUB']

    if !synced_at || synced_at < 1.day.ago
      update_attributes!(synced_at: Time.now, sync_in_progress: true)
      delay.sync_all_data
    end
  end

  def sync_all_data
    return if ENV['DISABLE_GITHUB']

    # sync starting
    update_attributes(synced_at: Time.now, sync_in_progress: true)

    # super important stuff
    sync_basic_data
    create_team_suggested_memberships_from_github_repos
    sync_tracker_relations

    # all done
    update_attributes!(sync_in_progress: false)
  end

  def create_team_suggested_memberships_from_github_repos
    # find all related teams
    response = api_with_auto_pagination(url: "/user/repos", headers: { 'Accept' => 'application/vnd.github.moondragon+json' })
    trackers = Github::Repository.update_attributes_from_github_array(response)
    teams = Team.where(id: trackers.map(&:team_id).uniq)

    # create "suggested" team membership (with no permissions)
    teams.each do |team|
      team.member_relations.where(person: self.person).first_or_create!(member: false, public: false, developer: false, admin: false, owner: self.person)
    end
  rescue Github::API::Unauthorized
    unlink_account_from_person!
  end

  def sync_tracker_relations

    # page through github API and get the owner/member repos for this user
    all_repo_data = api_with_auto_pagination(url: "/users/#{self.login}/repos?type=all")
    owned_repo_data = all_repo_data.select { |repo_data| repo_data['owner']['login'] == self.login }
    member_repo_data = all_repo_data.select { |repo_data| repo_data['owner']['login'] != self.login }

    # update fields in our DB, ensure TrackerRelation::Owner is set, and sync committer relations
    owned_repos = Github::Repository.update_attributes_from_github_array(owned_repo_data)
    member_repos = Github::Repository.update_attributes_from_github_array(member_repo_data)
    member_repos.each { |repo| TrackerRelation::Committer.find_or_create_by(tracker_id: repo.id, linked_account_id: id) }
    TrackerRelation::Committer.where("linked_account_id=? and tracker_id not in (?)", self.id, member_repos.map(&:id)).delete_all

    # update repos through orgs
    all_user_orgs = api_with_auto_pagination(url: "/users/#{self.login}/orgs")
    LinkedAccount::Github.update_attributes_from_github_array(all_user_orgs.map { |org| org.merge('type' => 'Organization') })
    all_org_repo_data = all_user_orgs.map { |org_data| api_with_auto_pagination(url: "/orgs/#{org_data['login']}/repos") }.flatten
    all_org_repos = Github::Repository.update_attributes_from_github_array(all_org_repo_data)
    all_org_repos.each { |repo| TrackerRelation::OrganizationMember.find_or_create_by(tracker_id: repo.id, linked_account_id: id) }
    TrackerRelation::OrganizationMember.where("linked_account_id=? and tracker_id not in (?)", self.id, all_org_repos.map(&:id)).delete_all

    if person && oauth_token
      # sync friends
      PersonRelation::Github.find_or_create_friends person

      # sync languages
      person.sync_languages

      # assigned/created/mentioned/subscribed across owned/member/org repos
      date_cursor = Date.tomorrow
      loop do
        response = api(url: "/search/issues", params: { q: "involves:#{self.login} created:<#{date_cursor}", per_page: 100, sort: 'created', order: 'desc' })
        raise "ERROR: auto paginating #{response.status}" unless response.success?
        break if response.data['items'].empty?
        old_date_cursor = date_cursor
        date_cursor = Date.parse(response.data['items'].last['created_at'])
        raise "Date cursors are the same: #{old_date_cursor} #{date_cursor}" if date_cursor == old_date_cursor
        issues = Github::Issue.update_attributes_from_github_array(response.data['items'])
        issues.each { |issue| FollowRelation.find_or_create_by(person: person, item: issue) }
      end

      # create FollowRelation for starred + watched repos
      starred_repo_data = api_with_auto_pagination(url: "/users/#{self.login}/starred")
      watched_repo_data = api_with_auto_pagination(url: "/users/#{self.login}/subscriptions")
      followed_repos = Github::Repository.update_attributes_from_github_array(starred_repo_data + watched_repo_data)
      followed_repos.each do |repo|
        FollowRelation.where(person: person, item: repo).first_or_create(active: true)
      end
    end

  end

  def unlink_account_from_person!
    update_attributes!(person: nil, oauth_token: nil, permissions: nil)
  end

protected

  def api_with_auto_pagination(options)
    response_data = []
    #load the maximum of 100 items since we're going to paginate
    options[:params] ||= {}
    options[:params].merge!(per_page: 100)
    loop do
      response = api(options.clone)
      raise "ERROR: auto paginating #{response.status}" unless response.success?

      response_data += response.data
      break unless options[:url] = response.link[:next]
    end

    return response_data
  end

end
