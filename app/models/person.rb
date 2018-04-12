# == Schema Information
#
# Table name: people
#
#  id                   :integer          not null, primary key
#  first_name           :string
#  last_name            :string
#  display_name         :string
#  email                :string           not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  buyer_id             :string
#  password_digest      :string
#  account_completed    :boolean          default(FALSE)
#  paypal_email         :string
#  last_seen_at         :datetime
#  last_bulk_mailed_at  :datetime
#  admin                :boolean          default(FALSE)
#  bio                  :text
#  location             :string
#  url                  :string
#  company              :string
#  public_email         :string
#  accepted_terms_at    :datetime
#  cloudinary_id        :string
#  deleted              :boolean          default(FALSE), not null
#  profile_completed    :boolean          default(FALSE), not null
#  shopping_cart_id     :integer
#  stripe_customer_id   :string
#  suspended_at         :datetime
#  bounty_hunter        :boolean
#  quickbooks_vendor_id :integer
#  reset_digest         :string
#  reset_sent_at        :datetime
#  confirmation_token   :string
#  confirmed_at         :datetime
#  confirmation_sent_at :datetime
#  unconfirmed_email    :string
#
# Indexes
#
#  index_people_on_email             (email) UNIQUE
#  index_people_on_shopping_cart_id  (shopping_cart_id)
#

class Person < ApplicationRecord
  include PasswordResetable
  include EmailVerification
  # temporarily holds a raw access token... useful in controllers-and-views
  attr_accessor :current_access_token

  before_save :format_url

  has_cloudinary_image

  has_paper_trail :only => [:first_name, :last_name, :display_name, :email, :password, :bio, :location, :public_email, :url, :company]

  has_account class_name: 'Account::Personal'
  has_many :orders, -> { where('type LIKE ?', 'Transaction::Order%') }, class_name: 'Transaction'

  has_many :bounty_claims
  has_many :bounty_claim_responses
  has_many :bounty_claim_events
  has_many :access_tokens
  has_many :saved_search_tabs

  # there is no longer a Github::Commit model -- CAB
  # has_many :commits, class_name: 'Github::Commit'
  has_many :fundraisers
  has_many :searches
  has_many :person_relations, class_name: 'PersonRelation::Base'

  has_many :friends,
           class_name:  'Person',
           through:     :person_relations,
           source:      :target_person

  # linked accounts
  has_many :linked_accounts,  class_name: 'LinkedAccount::Base'
  has_one :github_account,    class_name: 'LinkedAccount::Github::User'
  has_one :facebook_account,  class_name: 'LinkedAccount::Facebook'
  has_one :twitter_account,   class_name: 'LinkedAccount::Twitter'

  has_many :tracker_plugins
  has_many :tracker_relations, through: :linked_accounts

  has_many :tag_votes
  has_many :follow_relations

  has_many :team_member_relations
  has_many :teams, through: :team_member_relations

  has_many :pledges
  has_many :bounties
  has_many :team_payins

  has_many :solutions
  has_many :solution_events, through: :solutions

  has_many :language_relations, class_name: 'LanguagePersonRelation'

  has_many :developer_goals

  has_many :activity_logs
  has_many :issue_rank_caches, class_name: 'IssueRankCache'
  has_many :ranked_issues, through: :issue_rank_caches, source: :issue
  has_many :tracker_rank_caches, class_name: 'TrackerRankCache'

  has_many :shopping_carts

  has_many :tracker_person_relations

  has_many :addresses
  has_many :cash_outs
  has_many :proposals
  has_many :thumbs

  has_many :recommendation_events

  has_many :payment_methods
  has_many :support_levels

  has_many :team_bounty_hunters

  has_many :issue_suggestions

  has_many :comments, through: :linked_accounts

  belongs_to :quickbooks_vendor

  EMAIL_REGEX = /\A.+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+\z/

  # all Person objects must have an email address
  validates :email,
            uniqueness: true,
            format: { with: EMAIL_REGEX }

  # if a new password was set, validate it.  if there isn't an encrypted password, require one
  validates :password,
            length: { minimum: 8 },
            format: { with: /[a-z].*[0-9]|[0-9].*[a-z]/i, message: 'must contain a letter and a number' },
            if: Proc.new { |p| p.password_digest.blank? || !p.password.blank? }

  # NOTE: this only validates if accept is defined (aka: nil is valid)
  validates_acceptance_of :terms, :accept => true
  before_create do
    self.accepted_terms_at = Time.now if self.terms
  end

  has_secure_password

  #validates :paypal_email,
  #          confirmation: true,
  #          format: { with: EMAIL_REGEX },
  #          unless: "paypal_email.nil?"

  scope :distinct_backers, lambda { select('distinct people.*').joins(:bounties) }

  scope :celebrity, lambda { |min_followers=50|
    joins(:linked_accounts)
    .where("linked_accounts.person_id is not null and linked_accounts.followers > :min", min: min_followers)
    .group("people.id")
    .order("sum(linked_accounts.followers) desc")
    .select("people.*, sum(linked_accounts.followers) as total_followers")
    .includes(:twitter_account, :github_account)
  }

  scope :not_deleted, lambda { where.not(deleted: true).where(suspended_at: nil) }
  scope :active, lambda { not_deleted.where.not(confirmed_at: nil) }

  scope :bounty_hunters, lambda { |options={}|
    retval = active.where(bounty_hunter: true)

    if options[:team]
      retval = retval.where(id: options[:team].team_bounty_hunters.active.pluck(:person_id))
    end

    if options[:team]
      retval = retval.select("people.*, coalesce((select sum(amount) from bounty_claims where person_id=people.id and paid_out=true and issue_id in (select issue_id from bounties where owner_type='Team' and owner_id=#{options[:team].id})),0) as bounty_claim_total")
    elsif options[:since]
      retval = retval.select("people.*, coalesce((select sum(amount) from bounty_claims where person_id=people.id and paid_out=true and created_at > #{ApplicationRecord.connection.quote(options[:since])}),0) as bounty_claim_total")
    else
      retval = retval.select("people.*, coalesce((select sum(amount) from bounty_claims where person_id=people.id and paid_out=true),0) as bounty_claim_total")
    end

    retval = retval.order('bounty_claim_total desc')

    retval
  }

  def self.admin_search(query)
    results = where(%(lower(people.first_name) LIKE :q OR lower(people.last_name) LIKE :q OR lower(people.display_name) LIKE :q or lower(people.email) LIKE :q or lower(people.public_email) LIKE :q or people.id=:id), q: "%#{query}%".downcase, id: query.to_i)
    results.uniq
  end

  after_save do
    self.send_email(:account_created) if saved_change_to_email? && email_before_last_save.nil?
  end

  # NOTE: opting into a team implies becoming global bounty hunter
  def is_bounty_hunter!(options={})
    update_attribute(:bounty_hunter, true)

    teams = []
    if options[:team]
      teams << options[:team]
    elsif options[:issue]
      teams += Team.where(id: options[:issue].bounties.where(owner_type: 'Team').pluck(:owner_id))
    end

    teams.each do |team|
      tbh = team_bounty_hunters.where(team: team).first_or_create!
      tbh.update_attributes!(opted_out_at: nil) if tbh.opted_out_at
    end
  end

  # NOTE: opting out of team does not opt-out globally
  def is_not_bounty_hunter!(options={})
    if options[:team]
      tbh = team_bounty_hunters.where(team: options[:team]).first_or_create!
      tbh.update_attributes!(opted_out_at: Time.now) unless tbh.opted_out_at
    else
      update_attribute(:bounty_hunter, false)
    end
  end

  def active_bounties
    bounties.visible
  end

  def populate_friends
    PersonRelation::Github.find_or_create_friends   self if github_account
    PersonRelation::Facebook.find_or_create_friends self if facebook_account
    PersonRelation::Twitter.find_or_create_friends  self if twitter_account
  end

  def to_param
    display_name ? "#{id}-#{display_name.parameterize}" : "#{id}"
  rescue ActionView::Template::Error => e
    logger.error "ERROR: person##{id} #{e}"
    "#{id}"
  end

  def frontend_path
    "/users/#{to_param}"
  end

  def frontend_url
    File.join(Api::Application.config.www_url, frontend_path)
  end

  def self.authenticate(email, password)
    self.active.find_by_email(email).try(:authenticate, password)
  end

  def self.distinct_backers_count
    self.joins(:bounties).count(distinct: true)  # distinct_backers.count does NOT work
  end

  # similar to access_token but used for referring to a person, not authentication (i.e. passing through paypal IPN params)
  def create_perma_reference
    time = Time.now.to_i
    "#{self.id}.#{time}.#{self.class.hash_access_token(self, time).first(16)}"
  end

  def self.find_by_perma_reference(access_token)
    person_id, time, hash = (access_token||'').split('.')
    return nil if person_id.blank? || time.blank? || hash.blank?
    return nil unless (person = Person.find_by_id(person_id))
    return nil unless hash == self.hash_access_token(person, time).first(16)
    person
  end

  def create_access_token(request=nil)
    self.current_access_token = access_tokens.create!(!request ? {} : {
      remote_ip: request.remote_ip,
      user_agent: request.user_agent
    }).token
  end

  def self.find_by_access_token(token)
    # sometimes acces_tokens will have 4 param for admin. if so, ignore.
    token = token.split('.')[0..2].join('.') unless token.blank?
    access_token = AccessToken.where(token: token).first
    if access_token.try(:still_valid?)
      person = access_token.person
      person.current_access_token = token
      return person
    else
      return nil
    end
  end

  def send_email(which, options={})
    Rails.env.test? ? deliver_email(which, options) : delay.deliver_email(which, options)
  end

  def deliver_email(which, options={})
    message = Mailer.send(which, { person: self }.merge(options)).deliver
    if message
      # Log sent email
      SentEmail.create!(
        person: self,
        template: which,
        options: options
      )

      # log mixpanel event
      MixpanelEvent.track(
        person_id: self.id,
        event: 'Sent Email',
        template: which
      )
    end
    return message
  end

  # A backer is defined as anyone that's put a bounty on an issue
  def backer?
    bounties.count > 0
  end

  # check to see if all profile information is provided
  #def account_completed?
  #  self.account_completed = (first_name? and last_name? and email?)
  #  save if account_completed_changed?
  #  self.account_completed
  #end

  def display_name
    return attributes['display_name'] unless attributes['display_name'].blank?
    return "#{attributes['first_name']} #{attributes['last_name']}" unless attributes['first_name'].blank? && attributes['last_name'].blank?
    return '(unknown)'
  end

  def first_name
    return attributes['first_name'] unless attributes['first_name'].blank?
    return attributes['display_name'].split(' ',2)[0] unless attributes['display_name'].blank?
    return '(unknown)'
  end

  def last_name
    return attributes['last_name'] unless attributes['last_name'].blank?
    return attributes['display_name'].split(' ',2)[1] if attributes['display_name'] =~ / /
    return '(unknown)'
  end

  def full_name
    "#{first_name} #{last_name}"
  end

  # only update if it's been over an hour... this saves updating the DB for *every* request
  def was_seen!
    update_attribute(:last_seen_at, Time.now) if valid? && (last_seen_at.nil? || last_seen_at < 1.hour.ago)
  end

  def can_view?(model)
    return true if admin?
    return false unless model.is_a? ApplicationRecord

    # special cases
    case model
    when Pledge
      # you created the pledge, or are the fundraiser creator
      (self == model.person) or (self == model.fundraiser.person)
    else
      self == model.person
    end
  end

  # projects that the person is a committer/owner of
  def projects
    Tracker.includes(:tracker_relations => [:linked_account]).where('trackers.id in (:ids)', ids: tracker_relations.pluck(:tracker_id))
  end

  def followed_trackers
    Tracker.joins(:follow_relations).where('follow_relations.person_id = ? AND follow_relations.active = ?', id, true)
  end

  # mask this model instance so that display name reads
  # 'An anonymous user'
  def self.anon
    new(display_name: 'An anonymous user')
  end

  def start_work!(issue_id)
    DeveloperBidEvent::StartedWork.create(issue_id: issue_id, person_id: self.id)
  end

  def continue_work!(issue_id)
    DeveloperBidEvent::ContinuedWork.create(issue_id: issue_id, person_id: self.id)
  end

  def stop_work!(issue_id)
    DeveloperBidEvent::StoppedWork.create(issue_id: issue_id, person_id: self.id)
  end

  def idle!(issue_id)
    DeveloperBidEvent::Idle.create(issue_id: issue_id, person_id: self.id)
  end

  def complete_work!(issue_id)
    DeveloperBidEvent::CompletedWork.create(issue_id: issue_id, person_id: self.id)
  end

  def get_work_status(issue_id)
    DeveloperBidEvent.status(issue_id: issue_id, person_id: self.id)
  end

  # Sync languages from projects
  def sync_languages
    projects.find_each do |tracker|
      tracker.languages.find_each do |language|
        language_relations.find_or_create_by(language: language)
      end
    end
  end

  def self.top_backers
    bounty_posters = Person.joins(:bounties).where("bounties.owner_type IS NULL OR bounties.owner_type LIKE 'Person%'").merge(Bounty.visible).group("people.id, bounties.id").select("people.*, sum(bounties.amount) as total_backed").to_a
    pledge_givers = Person.joins(:pledges).where("pledges.owner_type IS NULL OR pledges.owner_type LIKE 'Person%'").merge(Pledge.active).group("people.id, pledges.id").select("people.*, sum(pledges.amount) as total_pledged").to_a
    top_backers_map = Hash.new(0)

    bounty_posters.each do |person|
      top_backers_map[person] += person.total_backed.to_i
    end

    pledge_givers.each do |person|
      top_backers_map[person] += person.total_pledged.to_i
    end

    return top_backers_map
  end

  def self.top_earners
    claim_creators = Person.joins(:bounty_claims => [:issue]).select("people.*, issues.bounty_total as total_collected")
    fundraiser_creators = Person.joins(:fundraisers).where("fundraisers.total_pledged > 0").group("people.id").select("people.*, sum(fundraisers.total_pledged) as total_received")
    top_earners_map = Hash.new(0)

    claim_creators.find_each do |person|
      top_earners_map[person] += person.total_collected.to_i
    end

    fundraiser_creators.find_each do |person|
      top_earners_map[person] += person.total_received.to_i
    end

    top_earners_map
  end

  # Autocreate ShoppingCart
  def shopping_cart
    cart = shopping_carts.find_by(id: shopping_cart_id) || shopping_carts.create!
    self.shopping_cart_id = cart.id
    save! if self.shopping_cart_id_changed?
    cart
  end

  #bunch of JSON rendering logic.. doesn't really belong in Person model.
  def get_ranked_issues
    issues = ranked_issues.joins(:issue_rank_caches).includes(:tracker).where("issue_rank_caches.rank > ?", 2).order("issue_rank_caches.rank DESC").limit(10)
  end

  def issues_from_ranked_trackers
    tracker_ids = tracker_rank_caches.order("rank DESC").limit(10).pluck(:tracker_id)
    trackers = Tracker.where(id: tracker_ids)
    trackers.map {|tracker| tracker.issues.includes(:tracker).top_issues_by_rank(5)}.flatten
  end

  def self.fill_out_issues(remaining = nil)
    #portion out remaining issue-spaces based on ranking
    issues = Tracker.proportional_issues_for_top_trackers({tracker_count: 5, issue_count: remaining})
  end

  def personalized_issues
    #limit queries. gather ID's and try to do one query.
    issues = []

    #grab personally relevant issues base on issue/tracker cached activity
    issues += get_ranked_issues
    issues += issues_from_ranked_trackers unless issues.count >= 100
    issues = issues.uniq {|issue| issue.id}
    #fill remaining space with popular issues from highly ranked trackers (based on global rank)
    issues += Person.fill_out_issues(150 - issues.count) unless issues.count >= 100
    issues.uniq { |i| i.id }.first(100)
  end

  # Null out personal information, but keep all models around.
  # Yeah, I know I am using destroy instead of delete_all. I want validations to run.
  def safe_destroy
    ApplicationRecord.transaction do
      # Person attributes stripped away
      self.first_name = '[deleted]'
      self.last_name = '[deleted]'
      self.email = "null-#{id}@bountysource.com"
      self.display_name = '[deleted]'
      self.paypal_email = nil
      self.image_url = nil
      self.bio = nil
      self.location = nil
      self.public_email = nil
      self.url = nil
      self.company = nil
      self.save!

      # Clear image_url
      ApplicationRecord.connection.execute("update people set cloudinary_id = NULL where id = #{id}")

      # Delete unpublished Fundraisers
      fundraisers.where(published: false).find_each(&:destroy)

      # Delete published fundraisers with no Pledges
      fundraisers.where(published: true).find_each { |fundraiser| fundraiser.delete if fundraiser.pledges.empty? }

      # Make Pledges and Bounties anonymous
      bounties.find_each { |bounty| bounty.owner_id = nil ; bounty.owner_type = nil ; bounty.save! }
      pledges.find_each { |pledge| pledge.owner_id = nil ; pledge.owner_type = nil ; pledge.save! }
      ApplicationRecord.connection.execute("update bounties set anonymous = 't' where person_id = #{id}")
      ApplicationRecord.connection.execute("update pledges set anonymous = 't' where person_id = #{id}")

      # Can safely delete BountyClaims that were never accepted
      bounty_claims.where(collected: false).each(&:destroy)

      # Null out person on logged searches
      searches.find_each { |search| search.update_attribute(:person, nil) }

      # Delete all of the things that we can
      solutions.find_each(&:destroy)
      developer_goals.find_each(&:destroy)
      team_member_relations.find_each(&:destroy)
      shopping_cart.destroy
      access_tokens.find_each(&:destroy)
      saved_search_tabs.find_each(&:destroy)
      addresses.find_each(&:destroy)
      person_relations.find_each(&:destroy)
      tracker_relations.find_each(&:destroy)
      tag_votes.find_each(&:destroy)
      follow_relations.find_each(&:destroy)
      team_member_relations.find_each(&:destroy)
      language_relations.find_each(&:destroy)
      activity_logs.find_each(&:destroy)
      issue_rank_caches.find_each(&:destroy)
      tracker_rank_caches.find_each(&:destroy)
      tracker_person_relations.find_each(&:destroy)

      # Unclaim some linked accounts
      if github_account
        github_account.oauth_token = nil
        github_account.permissions = nil
        github_account.person_id = nil
        github_account.save!
      end
      linked_accounts.where.not(type: 'LinkedAccount::Github::User').find_each(&:destroy)

      # if there is any money left in their account, transfer it back to liability
      if account && account.balance > 0
        from_account = account
        to_account = Account::Liability.instance
        amount = from_account.balance

        transaction = Transaction::InternalTransfer::DeletedOwner.create!(
          audited: true,
          description: "#{self.class.name}(#{id}) - $#{amount} owner deleted, reclaiming funds #{from_account.class.name}#{from_account.id} to #{to_account.class.name}(#{to_account.id})"
        )

        transaction.splits.create!(
          amount: -1 * amount,
          account: from_account,
          item: self
        )

        transaction.splits.create!(
          amount: amount,
          account: to_account,
          item: self
        )
      end

      update_attribute(:deleted, true)
    end
  end

  def languages
    Language.where(id: language_relations.where(active: true).pluck(:language_id))
  end

  # Set languages.
  def set_languages(*language_ids)
    ApplicationRecord.transaction do
      language_relations.update_all(active: false)
      language_ids.each do |language_id|
        relation = language_relations.where(language_id: language_id).first
        if relation
          relation.update_attribute(:active, true) unless relation.active?
        else
          language_relations.create(language: Language.find(language_id))
        end
      end
    end
    languages
  end

  def followed_trackers
    Tracker.where(
      id: follow_relations.select('item_id').
            where(active: true).
            where(
              'item_type LIKE ? OR item_type LIKE ?',
              '%Repository', '%Tracker'
            )
    )
  end

  def yearly_cash_out_totals
    #self.cash_outs.completed.inject({}) { |hash, cash_out| hash[cash_out.sent_at.year] = (hash[cash_out.sent_at.year] || 0.0) + cash_out.final_payment_amount; hash }
    self.cash_outs.completed.group('year').pluck('extract(year from sent_at) as year, sum(amount-coalesce(fee,0)+coalesce(fee_adjustment,0)) as final_payment_amount').inject({}) { |hash, (year, amnt)| hash[year.to_i] = amnt; hash }
  end

  def suspend!
    update_attributes(suspended_at: Time.now)
  end

  def admin_team_ids
    team_member_relations.where(admin: true).pluck(:team_id)
  end

  def workflow_issues
    issue_ids = []

    # bountied
    issue_ids += self.bounties.not_refunded.pluck(:issue_id)

    # thumbed
    issue_ids += self.thumbs.up_votes.where(item_type: 'Issue').pluck(:item_id)

    # issue suggestions
    issue_ids += self.issue_suggestions.pluck(:issue_id)

    # started work on
    issue_ids += self.solutions.pluck(:issue_id)

    # submitted claims for
    issue_ids += self.bounty_claims.pluck(:issue_id)

    # set goals
    issue_ids += self.developer_goals.pluck(:issue_id)

    # created via linked github account
    linked_account_ids = self.linked_accounts.pluck(:id)
    unless linked_account_ids.empty?
      query = Issue.where(author_linked_account_id: linked_account_ids).active
      query = query.where("created_at > ?", 3.months.ago) if query.count > 50
      issue_ids += query.pluck(:id)
    end

    # collection
    # NOTE: it sucks we don't track "closed_at"... so this is a half ass way to figure it out
    Issue.not_deleted.where(id: issue_ids.uniq).where("can_add_bounty=? or updated_at>?", true, 1.month.ago)
  end

  def suggested_issues
    issue_ids = []

    # issues i've commented on via github
    issue_ids += current_user.comments.pluck(:issue_id)
  end

protected

  def self.hash_access_token(person, time)
    Digest::SHA1.hexdigest("#{person.id}.#{time}.#{Api::Application.config.person_hash_secret}")
  end

  def format_url
    if self.url
      self.url = "https://#{self.url}" unless self.url[/^https?/]
    end
  end

end
