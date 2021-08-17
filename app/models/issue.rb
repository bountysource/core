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
#  category                 :integer
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
#  index_issues_partial_author_linked_account_id  (author_linked_account_id) WHERE (author_linked_account_id IS NOT NULL)
#  index_issues_partial_bounty_total              (bounty_total) WHERE (bounty_total > (0)::numeric)
#  index_issues_partial_thumbs_up_count           (thumbs_up_count) WHERE (COALESCE(thumbs_up_count, 0) > 0)
#

class Issue < ApplicationRecord
  STATIC_SUBCLASSNAMES = %w(
    Jira::Issue
    Bugzilla::Issue
    Trac::Issue
    Github::Issue
    GoogleCode::Issue
    SourceForge::Issue
    Launchpad::Issue
    Bitbucket::Issue
    Pivotal::Issue
    PhpTracker::Issue
    Savannah::Issue
    Mantis::Issue
    Gitlab::Issue
  )

  UNKNOWN_TITLE = '(Issue Title Unknown)'

  enum category: [:fiat, :crypto]

  has_paper_trail :only => [:remote_id, :url, :number, :title, :body, :body_markdown, :tracker_id, :can_add_bounty]

  has_many :bounties
  has_many :crypto_bounties
  has_many :crypto_pay_outs
  has_many :comments
  belongs_to :tracker
  has_many :languages, through: :tracker
  has_many :bounty_claims

  has_many :developer_goals

  belongs_to :accepted_bounty_claim, class_name: 'BountyClaim'

  has_many :solutions
  has_many :solution_events, through: :solutions

  has_many :activity_logs
  has_many :issue_rank_caches, class_name: 'IssueRankCache', dependent: :delete_all

  belongs_to :author, class_name: 'LinkedAccount::Base', foreign_key: :author_linked_account_id

  has_many :issue_ranks, dependent: :delete_all
  has_many :team_issue_ranks, class_name: 'IssueRank::TeamRank'

  has_one :request_for_proposal
  has_many :proposals, through: :request_for_proposal
  has_many :thumbs, as: :item
  has_one :issue_address

  has_account class_name: 'Account::IssueAccount'

  delegate :team, to: :tracker

  # VALIDATIONS
  validates :url, presence: true #, uniqueness: true
  validates :url, format: {with: /\A(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?\/.*\z/ix}
  validates :tracker_id, presence: true

  # SCOPES
  # default_scope             lambda { includes(:author) }
  scope :not_deleted,       lambda { where(deleted_at: nil) }
  scope :active,            lambda { where(can_add_bounty: true) }
  scope :closed,            lambda { where(can_add_bounty: false) }
  scope :unpaid,            lambda { where('paid_out = false AND bounty_total > 0') }
  scope :valuable,          lambda { where('bounty_total>0').order('bounty_total desc') }
  scope :newest,            lambda { order('remote_created_at desc') }
  scope :popular,           lambda { where('comment_count>0').order('comment_count desc') }
  scope :order_by_request_for_proposal, lambda { |direction| includes(:request_for_proposal).references(:request_for_proposal).select('issues.*').group('issues.id, request_for_proposals.id').order("COUNT(case request_for_proposals.state WHEN 'pending' then 1 else null end) #{direction}") }

  scope :authored_by,       lambda { |person|
    linked_account_ids = person.linked_accounts.pluck(:id)
    issue_ids_from_comments = Comment.where("author_linked_account_id in (?)", linked_account_ids).limit(1000).pluck(:issue_id).uniq
    where('issues.author_linked_account_id in (?) or issues.id in (?)', linked_account_ids, issue_ids_from_comments)
  }

  scope :solved, lambda { joins(:accepted_bounty_claim).where('bounty_claims.collected = true') }

  scope :closed_with_bounty,    lambda { where('issues.bounty_total > 0 AND issues.can_add_bounty = 0').order('updated_at asc') }
  scope :waiting_for_developer, lambda { joins(:accepted_bounty_claim).where('bounty_claims.collected = 1 AND bounty_claims.paid_out = 0').order('bounty_claims.created_at desc') }

  scope :top_issues_by_rank, lambda { |number=nil| order("COALESCE(participants_count,0) + COALESCE(thumbs_up_count,0) + COALESCE(votes_count,0) DESC").limit(number) }

  #define Event constants
  module Event
    VIEW = 'view'

    START_WORK = 'start_work'
    STOP_WORK = 'stop_work'
    RESTART_WORK = "restart_work"

    SET_DEVELOPER_GOAL = "set_developer_goal"
    UPDATE_DEVELOPER_GOAL = "update_developer_goal"
    DESTROY_DEVELOPER_GOAL = "destroy_developer_goal"

    POST_BOUNTY = 'post_bounty'

    BOUNTY_CLAIM = 'bounty_claim'
  end

  # Asynchronously increment appropriate Tracker issue counter
  # after_create do
  #   if can_add_bounty?
  #     tracker.update_attribute(:open_issues, tracker.open_issues + 1)
  #   else
  #     tracker.update_attribute(:closed_issues, tracker.open_issues + 1)
  #   end
  # end

  # Asynchronously increment or decrement Tracker issue counter
  # before_update do
  #   if can_add_bounty_changed?
  #     if can_add_bounty?
  #       tracker.reload.delay.update_attributes(
  #         open_issues: tracker.open_issues + 1,
  #         closed_issues: tracker.closed_issues - 1
  #       )
  #     else
  #       tracker.reload.delay.update_attributes(
  #         open_issues: tracker.open_issues - 1,
  #         closed_issues: tracker.closed_issues + 1
  #       )
  #     end
  #   end
  # end

  # Tell the Tracker Plugin to update this issue with new bounty total and/or message
  attr_accessor :dont_trigger_plugin_updates
  after_commit do
    # only the fields we care about
    fields_we_care_about = [:bounty_total, :can_add_bounty, :title, :body, :body_markdown]
    relevant_fields_changed = (previous_changes.keys.map(&:to_sym) & fields_we_care_about).length > 0

    # what if title changes? body?
    if relevant_fields_changed && !dont_trigger_plugin_updates && tracker.plugin
      tracker.plugin.delay.update_issues(issue: self)
    end
  end

  #scope :search, lambda { |terms|
  #  terms = terms.split(' ').map { |t| "%#{t}%" }
  #  sql_frags = terms.map { '(title like ? OR body like ?)' }.join(' AND ')
  #  values = terms.map { |t| [t,t] }.flatten
  #
  #  where(sql_frags, *values).order('bounty_total desc, comment_count desc').limit(10)
  #}

  # Mark Searchkick begin
  searchkick word_start: [:title, :body, :tracker_name]
  scope :search_import, -> { 
    where(can_add_bounty: true)
    .or(where('bounty_total > ?', 0))
    .includes(:languages, :tracker, :bounties) 
  }

  def search_data
    {
      title: title,
      body: body,
      tracker_name: tracker.name,
      languages_name: languages.map(&:name),
      bounty_total: crypto? ? crypto_bounty_total : bounty_total,
      language_ids: languages.map(&:id),
      tracker_id: tracker_id,
      can_add_bounty: can_add_bounty,
      backers_count: crypto? ? crypto_bounties.length : bounties.length,
      earliest_bounty: crypto? ? crypto_bounties.minimum(:created_at) : bounties.minimum(:created_at),
      participants_count: participants_count,
      thumbs_up_count: thumbs_up_count,
      remote_created_at: remote_created_at,
      comments_count: comment_count,
      paid_out: paid_out,
      category: category
    }
  end

  def crypto_bounty_total
    issue_address&.balance.nil? ? 0.0 : issue_address.balance["totalAmountInUSD"]
  end

  def should_index?
    can_add_bounty? || (bounty_total > 0)
  end
  # Mark Searchkick end

  def premerge(bad_model)
    self.account.try(:merge!, bad_model.account) #merge accounts but keep splits/transactions
    bad_model.issue_ranks.delete_all
    bad_model.issue_rank_caches.delete_all

    # TODO: why is this cached on the record rather than computed from claims?
    update_attributes!(accepted_bounty_claim: bad_model.accepted_bounty_claim) if !accepted_bounty_claim && bad_model.accepted_bounty_claim
  end

  def postmerge(bad_model)
    update_comment_cache_counters
    update_bounty_total

    # Move author from previous issue
    update_attributes(author: bad_model.author)
  end

  def self.top_issues_by_rank_cache(tracker_total, issue_total)
    issues = Tracker.proportional_issues_for_top_trackers({tracker_count: tracker_total, issue_count: issue_total})
  end

  def issue_rank
    (thumbs_up_count||0) + (votes_count||0) + (participants_count||0)
  end

  def active_bounties
    bounties.active
  end

  def visible_bounties
    #includes anonymous bounties
    bounties.includes(:owner, :person).not_refunded.where('amount > 0')
  end

  def self.featured
    issues = includes(:tracker).where(featured: true, paid_out: false).to_a.uniq {|issue| issue.tracker_id }
    Issue.where(id: issues.map(&:id))
  end

  def update_account_balance
    update_attributes(account_balance: account_balance)
  end

  def self.find_by_url(url)
    baseurl = (url || "").strip.gsub(/\Ahttps?:\/\//,'').gsub(/\/\Z/, '')
    where(:url => ["http://#{baseurl}","http://#{baseurl}/","https://#{baseurl}","https://#{baseurl}/"]).first
  end

  def self.find_or_create_by_url(url, opts = {})
    find_by_url(url) || create(opts.merge(url: url))
  end

  # SYNCING INSTANCE METHODS, OVERRIDE THESE AS NECESSARY
  def remote_sync_if_necessary(options={})
    false
  end

  def remote_sync(options={})
    raise "You need to implemenet this!"
  end

  # expects an array of { remote_id: 123, etc }
  def sync_comments_from_array(comment_list)
    comment_list.map!(&:with_indifferent_access)
    comment_map = comments.where(remote_id: comment_list.map { |c| c[:remote_id] }).inject({}) { |h,c| h[c.remote_id] = c; h }
    comment_list.each do |comment_hash|
      if comment_map.has_key?(comment_hash[:remote_id])
        comment_map[comment_hash[:remote_id]].update_attributes!(comment_hash)
      else
        comment_map[comment_hash[:remote_id]] = self.comments.create!(comment_hash)
      end
    end

    # Remove deleted or duplicate comments... anything that's not in our comment_map from above
    comments.where("id not in (?)", comment_map.values.map(&:id)).delete_all

    update_comment_cache_counters
  end

  # NOTE: watchers_count overrides participants_count and thumbs_up_count includes votes_count
  def update_comment_cache_counters
    update_attributes!(
      comment_count: comments.length,
      participants_count: watchers_count || ([self]+comments).map { |obj| obj[:author_linked_account_id] || obj[:author_name] }.uniq.length,
    )
    update_thumbs_up_count
  end

  def update_thumbs_up_count
    tmp_count = (votes_count || 0)
    tmp_count += self.thumbs.up_votes.count

    # TODO: exclude any votes which also have thumb_ups linked account (author_linked_account_id vs. author_name??)
    tmp_count += comments.select(&:thumbs_up?).length

    update_attributes!(thumbs_up_count: tmp_count)
  end

  # NORMAL INSTANCE METHODS
  def author_name
    super || 'Unknown'
  end

  def author_or_dummy_author
    if takendown?
      LinkedAccount::Base.new(login: Takedown::DISPLAY_NAME)
    elsif author.nil?
      LinkedAccount::Base.new(login: author_name)
    else
      author
    end
  end

  def body_html
    # override if necessary
    body
  end

  def to_param
    slugged = sanitized_title.try(:parameterize)
    slugged ? "#{id}-#{slugged}" : "#{id}"
  end

  # bit of a hack... well sneak the real created_at into it this way
  def real_created_at
    self[:remote_created_at] || self[:created_at]
  end

  def real_updated_at
    self[:remote_updated_at] || self[:updated_at]
  end

  def collected_event
    bounty_claims.paid_out.first.bounty_claim_events.collected.first
  end

  def short_body
    ActionView::Base.full_sanitizer.sanitize(body || '').truncate(140)
  end

  def update_bounty_total
    update_attribute :bounty_total, bounties.active.sum(:amount)

    # Note: need to update Tracker bounty_total AFTER the Issue,
    # since Tracker#update_bounty_total sums the cached issue
    # bounty_total column to save time (including Account models)
    tracker.update_bounty_total
  end

  def frontend_url
    File.join(Api::Application.config.www_url, frontend_path)
  end

  def frontend_path
    "/issues/#{self.to_param}"
  end

  def self.update_bounty_totals
    issue_ids = joins(:bounties).merge(Bounty.valuable).group('issues.id').pluck('issues.id')
    Issue.where(id: issue_ids).find_each do |issue|
      issue.delay.update_bounty_total
    end
  end

  # people who have started working on solutions to this issue
  def developers
    developer_ids = solutions.pluck(:person_id) + developer_goals.pluck(:person_id) + bounty_claims.pluck(:person_id)
    Person.where(id: developer_ids)
  end

  def backers
    fiat_backers = bounties.pluck(:person_id).uniq 
    crypto_backers = crypto_bounties.where(owner_type: 'Person').pluck(:owner_id).uniq 
    backers = fiat_backers + crypto_backers
    Person.where(id: backers.uniq)
  end

  # number of unique people who've backed this issue... used in issue nav tabs
  def backers_count
    fiat_backers = Bounty.not_refunded.where(issue_id: self.id).distinct.count(:person_id)
    return fiat_backers unless fiat_backers.zero?
    crypto_bounties.count
  end

  # number of developers who have/could solve this
  def developers_count
    person_ids = []
    person_ids += solutions.pluck(:person_id)
    person_ids += bounty_claims.pluck(:person_id)
    person_ids += developer_goals.pluck(:person_id)

    person_ids.uniq.length
  end

  def generic?
    self.class == Issue
  end

  def can_respond_to_claims?(person)
    Ability.new(person).can?(:respond_to_claims, self)
  end

  # methods for Solutions
  def solution_for_person(person)
    solutions.where(person_id: person.id).first
  end

  def active_solutions
    solutions.loaded? ? solutions.select { |s| s.status == 'started'  } : solutions.active
  end

  def collected_bounty_claim
    bounty_claims.loaded? ? bounty_claims.select { |c| c.collected }.first : bounty_claims.where(collected: true).first
  end

  # strip trailing dollar signs and bounty amounts
  def sanitized_title
    return Takedown::ISSUE_TITLE if takendown?
    TrackerPlugin::GH.title_without_plugin(self) || Issue::UNKNOWN_TITLE
  end

  def empty_title?
    sanitized_title == Issue::UNKNOWN_TITLE
  end

  def sanitized_body_html
    return Takedown::SANITIZED_HTML if takendown?
    html = GitHub::Markdown.render_gfm(TrackerPlugin::GH.body_without_plugin(self)) if body_markdown
    html = (body||"").gsub(/<p><bountysource-plugin>[\s\S]*?<\/bountysource-plugin><\/p>/, '') unless html
    # Remove badge if issue body already has a badge
    html = html.gsub(/<a href="https:\/\/www.bountysource.com\/issues\/.*<img src="https:\/\/api.bountysource.com\/badge.*"><\/a>/, '')
    html = ActionController::Base.helpers.sanitize(html)
    html
  end

  def truncate_body_markdown
    self[:body_markdown].truncate(140) if self[:body_markdown]
  end

  # has the author issued a takedown for the title/body? comments by others will still appear.
  # NOTE: this is unrelated to the entire tracker (and all issues) being takendown.
  def takendown?
    author_linked_account_id && Takedown.linked_account_id_has_takedown?(author_linked_account_id)
  end

  def accepting_proposals?
    # pending RFP's can still accept proposals
    # alias request_for_proposal for a method that returns a null object
    request_for_proposal.try(:pending?)
  end

  def workflow_state
    # shortcuts
    is_open = can_add_bounty?
    is_closed = !can_add_bounty?
    bounty_available_sum = bounties.active.sum(:amount)
    solutions_count = solutions.active.count
    min_dev_goal = developer_goals.pluck('min(amount)').first || 0

    # start with "complete" and work backwards
    state = :issue_closed_complete

    state = :issue_open_new if is_open
    state = :issue_open_goal_unmet if is_open && (min_dev_goal > bounty_available_sum)
    state = :issue_open_sufficient_bounty if is_open && (min_dev_goal <= bounty_available_sum) && (bounty_available_sum > 0)
    state = :issue_open_work_started if is_open && solutions_count > 0
    state = :issue_closed_unclaimed if is_closed && bounty_available_sum > 0
    state = :issue_closed_claimed if is_closed && bounty_claims.count > 0 && bounty_claims.where(collected: true).count == 0

    return state


    # [
    #   :issue_open,
    #   :issue_open_goal_unmet,
    #   :issue_open_sufficient_bounty,
    #   :issue_open_work_started,
    #   :issue_closed_unclaimed,
    #   :issue_closed_rejected_claims,
    #   :issue_closed_claim_vote_needed,
    #   :issue_closed_claim_waiting,
    #   :issue_closed_complete
    # ]

    # My Thumbs / Issues I’ve created
    # - no goals, no bounties
    # Unmet Bounty Goal
    # - Issues I’ve bountied/thumbed/created
    # - where I set the goal
    # Bountied, Needs Developer
    # - My Bounty Goal Met
    # - I “Stopped work”
    # - Issues I’ve bountied/thumbed/created that have bounties
    # Started Work
    # - Issues I’ve bountied/thumbed/created started by other dev
    # - my Start Work
    # Issue closed but Unclaimed Bounties
    # - issues I’ve bountied/thumbed/created
    # - issues I’ve started work
    # issue closed, but claims Rejected
    # - by Me
    # - on my Claims
    # Bounty Claims - I Need to Vote
    # - I need to vote on this claim
    # Bounty Claims - Waiting on others (no rejections)
    # - Issues I’ve bountied (I voted in favor)
    # - Issues I’ve thumbed/created
    # - Claims submitted, waiting on votes
  end

end
