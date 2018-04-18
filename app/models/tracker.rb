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

class Tracker < ApplicationRecord
  STATIC_SUBCLASSNAMES_API = %w(
    Jira::API
    Bugzilla::API
    Trac::API
    Github::API
    GoogleCode::API
    SourceForge::API
    Launchpad::API
    Bitbucket::API
    Pivotal::API
    PhpTracker::API
    Savannah::API
    Mantis::API
  )

  STATIC_SUBCLASSNAMES = %w(
    Jira::Tracker
    Bugzilla::Tracker
    Trac::Tracker
    Github::Repository
    GoogleCode::Tracker
    SourceForge::Tracker
    Launchpad::Tracker
    Bitbucket::Tracker
    Pivotal::Tracker
    PhpTracker::Tracker
    Savannah::Tracker
    Mantis::Tracker
  )

  class RemoteAPI
    class Error < StandardError; end
    # sync a single issue given the URL
    def self.fetch_issue(options={})
      new_relic_data_point "Custom/external_api/#{self.to_s}/fetch_issue"
      options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
      options[:html] ||= HTTParty.get(options[:url], timeout: 15, headers: { 'User-Agent' => Api::Application.config.chrome_user_agent }).body
      parse_single_issue(options[:html])
    end

    def self.fetch_issue_list(options={})
      base_url = options[:url]
      options[:url] = File.join(options[:url].to_s, options[:path].to_s) if options[:path]
      options[:html] ||= HTTParty.get(options[:url], timeout: 15, headers: { 'User-Agent' => Api::Application.config.chrome_user_agent }).body
      parse_issue_list(base_url, options[:html])
    end

    protected
    def self.parse_single_issue(response = "")
      raise "Unimplemented"
    end

    def self.parse_issue_list(base_url, response = "")
      raise "Unimplemented"
    end
  end

  #define Event constants
  module Event
    VIEW = 'view'
    FOLLOW = 'follow'
    UNFOLLOW = 'unfollow'
    EDIT = 'edit'
  end

  before_validation do
    self.url += "/" if self.url =~ /\A(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?\z/
  end

  # VALIDATIONS
  validates :url, uniqueness: true, presence: true
  validates :url, format: {with: /\A(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?\/.*\z/ix}
  validates :name, presence: true
  validates :project_tax, numericality: { greater_than_or_equal_to: 0.0, less_than_or_equal_to: 0.2000 }

  # RELATIONSHIPS
  has_cloudinary_image

  has_paper_trail :only => [:name, :url, :description, :homepage, :repo_url, :remote_name, :remote_description]

  belongs_to :team

  has_many :issues
  has_many :bounties, through: :issues

  # languages many-to-many
  has_many :language_relations, class_name: "TrackerLanguageRelation", dependent: :delete_all
  has_many :languages, through: :language_relations

  has_one :plugin, class_name: "TrackerPlugin", foreign_key: :tracker_id
  has_many :tracker_relations

  has_many :follow_relations, as: :item
  has_many :followers, through: :follow_relations, source: :person

  # has_and_belongs_to_many :teams
  has_many :team_relations, class_name: "TeamTrackerRelation"
  has_many :teams, through: :team_relations

  has_many :bounty_claims, through: :issues

  has_many :tracker_person_relations

  has_many :activity_logs
  has_many :tracker_rank_caches, class_name: 'TrackerRankCache', dependent: :delete_all

  has_many :fundraiser_tracker_relations
  has_many :fundraisers, through: :fundraiser_tracker_relations


  # TODO trackers shouldn't have accounts, but rather projects/repositories(github)
  has_account class_name: 'Account::Repository'

  # SCOPES
  scope :featured, lambda { where(featured: true) }
  scope :not_featured, lambda { where(featured: false) }
  scope :not_deleted, lambda { where(deleted_at: nil) }

  scope :top_ranked, lambda { |limit = nil|
    where('rank > 0 AND cloudinary_id IS NOT NULL').reorder('rank DESC')
  }

  scope :valuable, lambda {
    where('trackers.bounty_total > 0').order('trackers.bounty_total desc')
  }

  after_commit do
    team_ids = []
    team_ids << team_id
    team_ids << previous_changes[:team_id]
    Team.where(id: team_ids.compact.uniq).each(&:update_activity_total)
  end

  def self.admin_search(query)
    results = where(%(name LIKE :q OR description LIKE :q OR full_name LIKE :q), q: "%#{query}%")
    results += where(id: query)
    results.uniq
  end

  def self.collection_size_override
    10000
  end

  searchkick word_start: [:name]

  def search_data
     {
       name: name,
       watchers: watchers,
       forks: forks,
       open_issues: open_issues,
       bounty_total: bounty_total
     }
   end

  def premerge(bad_model)
    self.account.try(:merge!, bad_model.account) #merge accounts but keep splits/transactions
    bad_model.language_relations.where("language_id in (?)", self.language_relations.pluck(:language_id)).delete_all
    bad_model.tracker_rank_caches.delete_all
    update_attributes(team: bad_model.team) if !team && bad_model.team
  end

  def postmerge(bad_model)
    update_bounty_total
  end

  def remote_languages
    Language.where(id: remote_language_ids)
  end

  def self.proportional_issues_for_top_trackers(options = {})
    #takes two options. tracker_count for how many trackers we want issues from. issues_count for the total number of issues we need to get
    tracker_rank_map = Tracker.top_ranked(options[:tracker_count]).inject({}) do |hash, tracker|
      hash[tracker] = tracker.tracker_rank_caches.sum(:rank)
      hash
    end

    total_weight = tracker_rank_map.values.sum.to_f
    #calculate how many issues each tracker should receive.
    issue_ids = []
    tracker_rank_map.each do |tracker, weight|
      percentage_of_issues = weight / total_weight
      issue_ids += tracker.issues.top_issues_by_rank((options[:issue_count] * percentage_of_issues).round).pluck(:id)
    end
    Issue.includes(:tracker).where(id: issue_ids)
  end

  def self.editable_whitelist
    %w(image_url name description homepage repo_url language_ids)
  end

  def active_followers
    ids = follow_relations.active.pluck(:person_id)
    Person.where(id: ids)
  end

  def active_bounties
    bounties.visible
  end

  def valuable_bounties
    bounties.valuable
  end

  def backers
    top_backers_map = Hash.new(0)
    #sum all active and paid out bounties for top_backers section using scope #not_refunded

    # TODO: preload owner somehow because this loop fires off too many queries
    top_backers_map = bounties.not_refunded.inject(top_backers_map) do |hash, bounty|
      hash[bounty.owner] += bounty.amount if bounty.owner && !bounty.anonymous
      hash
    end
    # sorted_backers = top_backers_map.sort_by {|key, value| value}
  end

  # takes a URL and forgivingly searches for similar urls (tries http and https. tries trailing slash and not)
  def self.find_by_url(url)
    baseurl = (url || "").strip.gsub(/\Ahttps?:\/\//,'').gsub(/\/\Z/, '')
    where(url: ["http://#{baseurl}","http://#{baseurl}/","https://#{baseurl}","https://#{baseurl}/"]).first
  end

  def self.find_or_create_by_url(url, opts = {})
    find_by_url(url) || create(opts.merge(url: url))
  end

  def self.has_full_name?
    false
  end

  def self.magically_turn_url_into_tracker_or_issue(url, options={})
    # nothing to see here
    return nil if url.blank? || !(url.match(/\Ahttps?:\/\//))

    # strip url hash
    url = url.gsub(/#.*/,'')

    if (issue_id = url.match(/\Ahttps:\/\/www\.bountysource\.com\/issues\/(\d+)/).try(:[], 1)) && (issue = Issue.where(id: issue_id).first)
      # we already have this as an issue in our DB
      return issue
    elsif issue = Issue.find_by_url(url)
      if issue.tracker.is_a? TrackerUnknown
        #try to reparse issue
      else
        # we already have this as an issue in our DB
        return issue
      end
    elsif tracker = Tracker.find_by_url(url)
      # we already have this as a tracker in our DB
      return tracker
    end

    if info = extract_info_from_url(url)
      # sometimes we get back real objects and don't need to create them
      return info if info.is_a?(Issue) || info.is_a?(Tracker)

      # load the tracker
      if info[:tracker_class] == TrackerUnknown
        tracker = TrackerUnknown.singleton
      elsif tracker = Tracker.find_by_url(info[:tracker_url])
        unless tracker.class == info[:tracker_class]
          tracker.type = info[:tracker_class].name
          tracker.save!
          tracker = Tracker.find_by_url(info[:tracker_url])
        end
      else
        tracker = info[:tracker_class].new(url: info[:tracker_url], name: info[:tracker_name])

        # Special case for GitHub. Add the full_name attribute
        if info[:tracker_class].has_full_name?
          tracker.full_name = info[:tracker_full_name]
        end

        # pp tracker.attributes
        # pp info
        tracker.save!

        # Add a singleton method to the Tracker instance to determine if it was magically created.
        # Used by Search to tell frontend whether or not we need to poll for asynchronously loaded Issues.
        tracker.singleton_class.class_eval do
          def magically_created?
            true
          end
        end
      end

      # if we don't have an issue, we might as well stop now
      return tracker unless info[:issue_url]

      # find or create an issue
      if issue = Issue.find_by_url(info[:issue_url])
        unless issue.class == info[:issue_class]
          issue.type = info[:issue_class].name
          issue.save!
          issue = Issue.find_by_url(info[:issue_url])
        end
        issue.number = info[:issue_number]
        issue.tracker = tracker
        issue.title = info[:issue_title]
        issue.save!
        issue.reload
      else
        issue = tracker.issues.create!(url: info[:issue_url], number: info[:issue_number], title: info[:issue_title])
      end

      issue.remote_sync if options[:remote_sync_on_create]

      # we should have a valid issue now
      return issue
    end
  end

  # given a URL, this runs through all the available tracker types and sees if it can figure stuff out
  def self.extract_info_from_url(url, html=nil)
    # some trackers can figure it out with URL only... so start with those.
    url_classes = Tracker::STATIC_SUBCLASSNAMES_API.map(&:constantize).reject { |k| k.needs_html_to_extract? }
    html_classes = Tracker::STATIC_SUBCLASSNAMES_API.map(&:constantize).select { |k| k.needs_html_to_extract? }

    # first try trackers that can look at URL only (no http get necessary)
    info = url_classes.find_value { |klass| klass.extract_info_from_url(url) }
    return info if info

    # load URL, follow redirects keeping last URL
    unless html
      # buzilla doesn't play nicely without a User-Agent header
      resp = HTTParty.get(url, timeout: 5, headers: { 'User-Agent' => Api::Application.config.chrome_user_agent }, verify: false)
      real_url = resp.request.last_uri.to_s
      html = resp.body

      # if it was a redirect, start over from the top so other trackers can match by URL
      if url != real_url
        return extract_info_from_url(real_url, html)
      end
    end

    # second, try classes taht need html
    info = html_classes.find_value { |klass| klass.extract_info_from_url(url, html) }
    return info if info

    # got this far, let's make a generic issue
    page = Nokogiri::HTML(resp)
    title = page.css('title').text
    return {
      tracker_class: TrackerUnknown,
      issue_url: url,
      issue_title: title.blank? ? nil : title,
      issue_class: Issue
    }
  end

  # update all bounty totals
  def self.update_bounty_totals
    valuable.pluck('trackers.id').each { |id| find(id).update_bounty_total }
  end

  # return cards to CardsController
  def self.cards
    where('bounty_total > 0').order('bounty_total desc')
  end

  def sync_issues_from_array(remote_issue_data)
    # create or update issues
    remote_issue_data.each do |data|
      begin
        issue_data = data.reject { |k,v| [:comments].include?(k) }
        comments_data = data.has_key?(:comments) ? data[:comments] : nil

        local_issue = Issue.where(url: issue_data[:url]).first

        # default tracker to self but might already be set (i.e. launchpad)
        issue_data[:tracker] ||= self

        if local_issue
          local_issue.update_attributes!(issue_data)
        else
          local_issue = issue_data[:tracker].issues.create!(issue_data)
        end

        # if we have comments in the remote info, sync 'em right away
        local_issue.sync_comments_from_array(comments_data) unless comments_data.nil?
      rescue => e
        # race conditions between frontend and backend loading
        raise# unless e.message =~ /Duplicate entry/ || e.message =~ /Url has already been taken/
      end
    end

    self
  end

  # REMOTE SYNC INSTANCE METHODS
  def remote_sync_if_necessary(options={})
    false
  end

  def remote_sync(options={})
    raise "You need to implemenet this!"
  end

  # does a synchronous tracker sync to load all issues and then syncs issue via delayed job
  def full_sync
    remote_sync(force: true)

    # TODO update with pages of issues instead, this is VERY inefficient with API calls
    issues.active.each { |i| i.delay.remote_sync }
  end

  # INSTANCE METHODS
  def to_param
    "#{id}-#{name.parameterize}"
  end

  def frontend_path
    "/trackers/#{to_param}"
  end

  def frontend_url
    File.join(Api::Application.config.www_url, frontend_path)
  end

  def update_bounty_total
    # Note: sum bounty_total, not account_balance to avoid instantiating Account objects
    self.bounty_total = issues.unpaid.sum(:bounty_total)

    save
  end

  # NOTE: not used yet
  def update_tracker_cache_counters
    update_attributes!(
      open_issues: issues.active.count,
      closed_issues: issues.closed.count
    )
  end

  def convert_to(new_type)
    new_type = new_type.to_s
    raise "Invalid type: #{new_type}" unless Tracker::STATIC_SUBCLASSNAMES.include?(new_type)
    return unless self.type == "Tracker"

    self.issues.update_all(type: new_type.gsub(/(Tracker|Repository)/,'Issue'))
    self.type = new_type
    self.save
    self.delay.remote_sync
  end

  def generic?
    self.class == Tracker
  end

  def set_owner(team)
    update_attributes!(team: team)
    reload.team
  end

  def claim(team)
    # if you own a team, also set up the tracker_relation
    team.tracker_relations.create(tracker: self)

    set_owner(team) unless self.team
    team
  end

  def unclaim
    self.team = nil
    self.save
  end

  def relation_for_person(person)
    tracker_person_relations.where(person_id: person.id).first
  end

  # Is person following this tracker?
  def followed_by?(person)
    follow_relation_for_person(person).active?
  end

  def follow_relation_for_person(person)
    follow_relations.where(person_id: person.id).first
  end

  def update_languages
    raise "Not implemented"
  end

  # Add a language to the tracker
  def add_language(language)
    language_relations.find_or_create_by(language_id: language.id)
  end

  def display_name
    name
  end

  def self.update_ranks
    joins(:tracker_rank_caches).group('trackers.id').select('trackers.id, sum(tracker_rank_caches.rank) AS total_rank').find_each do |result|
      Tracker.find(result.id).update_attribute(:rank, result.total_rank)
    end
  end

  # sum/avg of days that issues have been open
  def issue_stats
    issue_days_row = ApplicationRecord.connection.select_one("select sum(floor((extract(epoch from now()) - extract(epoch from remote_created_at)) / (60*60*24))) as sum, avg(floor((extract(epoch from now()) - extract(epoch from remote_created_at)) / (60*60*24))) as avg from issues where tracker_id=#{self.id} and can_add_bounty=true")
    {
      days_open_total: issue_days_row['sum'].to_i,
      days_open_average: issue_days_row['avg'].to_i,
      open: issues.active.count
    }
  end

  def takendown?
    false
  end
end
