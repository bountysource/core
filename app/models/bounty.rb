# == Schema Information
#
# Table name: bounties
#
#  id                :integer          not null, primary key
#  amount            :decimal(10, 2)   not null
#  person_id         :integer
#  issue_id          :integer          not null
#  status            :string(12)       default("active"), not null
#  expires_at        :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  paid_at           :datetime
#  anonymous         :boolean          default(FALSE), not null
#  owner_type        :string
#  owner_id          :integer
#  bounty_expiration :string
#  upon_expiration   :string
#  promotion         :string
#  acknowledged_at   :datetime
#  tweet             :boolean          default(FALSE), not null
#  featured          :boolean          default(FALSE), not null
#
# Indexes
#
#  index_bounties_on_anonymous        (anonymous)
#  index_bounties_on_github_issue_id  (issue_id)
#  index_bounties_on_owner_id         (owner_id)
#  index_bounties_on_owner_type       (owner_type)
#  index_bounties_on_patron_id        (person_id)
#  index_bounties_on_status           (status)
#

require 'account/team'

class Bounty < ApplicationRecord
  belongs_to :person
  belongs_to :issue

  # TODO: this object shouldn't have an account... rework Transaction.build to use "account: bounty.issue"
  has_one :account, :through => :issue
  has_many :splits, :as => :item
  has_many :txns, :through => :splits

  has_one :bounty_claim_response

  # Helper defined in config/initializers/has_owner.rb
  # Gives access to polymorphic owner, which respects object anonymity on read
  has_owner

  validates :issue, presence: true
  validates :amount, numericality: { greater_than_or_equal_to: 5 }

  # define status constants
  module Status
    ACTIVE = 'active'
    REFUNDED = 'refunded'
    PAID = 'paid'

    def self.all
      [ACTIVE, REFUNDED, PAID]
    end
  end

  validates :status, inclusion: { in: Status.all }

  scope :active, lambda { where(status: Status::ACTIVE) }
  scope :refunded, lambda { where(status: Status::REFUNDED) }
  scope :paid, lambda { where(status: Status::PAID) }
  scope :not_refunded, lambda { where("status != :status", status: Status::REFUNDED) }

  # A bounty is visible so long as it has not been refunded, and is not anon
  scope :visible, lambda { where("anonymous = false AND status != :status", status: Status::REFUNDED) }

  scope :expiring_soon,       lambda { |date=2.weeks.from_now, count=nil| where('expires_at < ?', date).order('expires_at desc').limit(count) }

  # bounties that count toward the displayed bounty total of issues
  scope :valuable, lambda { active.where('amount > 0') }

  scope :acknowledged, lambda { where("acknowledged_at IS NOT NULL") }
  scope :unacknowledged, lambda { where(acknowledged_at: nil) }

  before_create do
    self.owner ||= self.person

    # If no options were provided, automatically acknowledge the bounty,
    # meaning that it needs no interaction from us (feature, tweet, newsletter, etc.).
    unless bounty_expiration? || upon_expiration? || promotion?
      self.acknowledged_at = DateTime.now
    end
  end

  after_commit do
    team_ids = []
    team_ids << owner_id if owner_type == 'Team'
    team_ids << previous_changes[:owner_id] if previous_changes[:owner_id] && (previous_changes[:owner_type] || owner_type) == 'Team'
    team_ids << issue.tracker.team_id
    Team.where(id: team_ids.compact.uniq).each(&:update_activity_total)
  end

  validate do
    if !new_record? && anonymous_changed? && !can_make_anonymous? && false
      errors.add(:anonymous, "cannot be changed")
    end
  end

  class CannotRefund < StandardError; end

  def self.created_this_month
    now = DateTime.now
    where(created_at: (now.beginning_of_month..now.end_of_month)).order('created_at desc')
  end

  def self.admin_search(query)
    joins(:person)
    .where("bounties.id = :id OR people.email like :q OR people.first_name LIKE :q OR people.last_name LIKE :q OR people.display_name LIKE :q", q: "%#{query}%", id: query.to_i)
  end

  def self.summary(owner)
    collection = {}
    owner.bounties.not_refunded.includes(:issue => { :tracker => :team }).each do |bounty|
      key = (!bounty.issue.tracker.team || bounty.issue.tracker.team == owner) ? bounty.issue.tracker : bounty.issue.tracker.team
      collection[key] ||= { paid: 0.0, active: 0.0 }
      collection[key][:paid] += bounty.amount if bounty.paid?
      collection[key][:active] += bounty.amount if bounty.active?
    end
    collection.map { |k,v|
      {
        paid: v[:paid],
        active: v[:active]
      }.merge(k.is_a?(Team) ? { team: k } : {}).merge(k.is_a?(Tracker) ? { tracker: k } : {})
    }.sort_by { |s| s[:active] }.reverse
  end

  def repository
    issue.tracker
  end

  #def default_expires_at
  #  self.expires_at ||= 6.months.from_now
  #end

  def amount=(amount)
    clean_amount = ('%.2f' % amount.to_s.strip.gsub(/[$,]*/, '')) rescue nil
    write_attribute(:amount, clean_amount)
  end

  def to_s
    "$#{Money.new(100 * amount, 'USD')}"
  end
  alias_method :display_amount, :to_s

  # Used during payment to create Transactions with item
  def item_name
    issue.title
  end

  def self.amount_paid_since(date)
    Bounty.paid.where('paid_at > :d', d: date).sum(:amount).to_i
  end

  def self.amount_paid_to_date
    Bounty.paid.sum(:amount).to_i
  end

  def self.amount_unclaimed
    Bounty.active.sum(:amount).to_i
  end

  # @return [Bounty]
  def self.issues_with_largest_bounties
    self.group(:issue).order('sum_amount desc').sum(:amount)
  end

  # @return [OrderedHash] { Person: amount, ... }
  def self.most_total_bounties(count=nil)
    self.group(:person).limit(count).order('sum_amount desc').sum(:amount)
  end

  def send_bounty_increased_emails
    targets = []
    targets += issue.backers
    targets += issue.developers
    targets += issue.tracker.active_followers
    targets += Person.bounty_hunters(team: owner) if owner.is_a?(Team)
    targets -= [person]

    targets.uniq.each { |person| person.send_email(:bounty_increased, bounty: self) }
  end

  def send_bounty_placed_emails
    targets = []
    targets += issue.backers
    targets += issue.developers
    targets += issue.tracker.active_followers
    targets += Person.bounty_hunters(team: owner) if owner.is_a?(Team)
    targets -= [person]

    targets.uniq.each { |person| person.send_email(:bounty_placed, bounty: self) }
  end

  def refundable?
    # check status, can only be active.
    unless status == Status::ACTIVE
      errors.add :base, "Bounty is not active, its status is: #{status}"
    end

    # the issue cannot have any claims in the dispute period
    unless issue.bounty_claims.select(&:in_dispute_period?).empty?
      errors.add(:issue, "has one or more bounty claims in dispute period")
    end

    errors.empty?
  end

  def frontend_path
    "/issues/#{issue.id}/bounties/#{id}/receipt"
  end

  def frontend_url
    File.join(Api::Application.config.www_url, frontend_path)
  end

  # Refund bounty to the person who created it. The amount refundable is simply
  # the amount - (amount * bs fee)
  def refund!
    if refundable?
      self.class.transaction do
        transaction = Transaction.build do |tr|
          tr.description = "Refund Bounty(#{id}) - Bounty Amount: $#{amount} Refunded: $#{amount}"
          tr.splits.create(amount: -amount, item: issue)
          if owner_type == "Team"
            tr.splits.create(amount: +amount, item: owner)
          else
            tr.splits.create(amount: +amount, item: person)
          end
        end

        transaction or raise ActiveRecord::Rollback

        # update bounty to 'refunded' status or rollback
        update_attributes status: Status::REFUNDED or raise ActiveRecord::Rollback

        # email the backer
        person.send_email :bounty_refunded, bounty: self, transaction: transaction
      end

      # update displayed bounty total on issue
      issue.delay.update_bounty_total
    end
  end

  def refund_for_deleted_issue
    if refundable?
      self.class.transaction do
        transaction = Transaction.build do |tr|
          tr.description = "Refund Bounty for deleted issue (#{id}) - Bounty Amount: $#{amount} Refunded: $#{amount}"
          tr.splits.create(amount: -amount, item: issue)
          if owner_type == "Team"
            tr.splits.create(amount: +amount, item: owner)
          else
            tr.splits.create(amount: +amount, item: person)
          end
        end

        transaction or raise ActiveRecord::Rollback

        # update bounty to 'refunded' status or rollback
        update_attributes status: Status::REFUNDED or raise ActiveRecord::Rollback

        # email the backer
        person.send_email :bounty_refunded_for_deleted_issue, bounty: self
      end

      # update displayed bounty total on issue
      issue.delay.update_bounty_total
    end
  end

  def create_account
    issue.create_account!
  end

  def build_account
    issue.build_account
  end

  def active?
    status == Status::ACTIVE
  end

  def paid?
    status == Status::PAID
  end

  def refunded?
    status == Status::REFUNDED
  end

  # TODO move to has_owner.rb ?
  def can_make_anonymous?
    owner && owner.is_a?(Person)
  end

  def acknowledged?
    acknowledged_at?
  end

  # Did the user specify any options with their bounty? Custom expiration date, featured, etc.
  def has_options?
    bounty_expiration.present? || upon_expiration.present? || promotion.present?
  end

  def after_purchase(order)
    # Update budget balance for the user
    if order.checkout_method.is_a?(Account::Team)
      relation = order.checkout_method.owner.member_relations.where(person_id: person.id).first
      relation.update_balance(order.gross)
    end

    issue.update_bounty_total

    # track Bounty creation in new relic
    new_relic_data_point "Custom/Bounty/pay_in", amount.to_f

    # send a receipt email to the backer
    person.send_email(:bounty_created, bounty: self)

    if self.issue.bounties.count == 1
      # send emails to backers, developers and followers that a bounty has been created on an issue
      delay.send_bounty_placed_emails
    else
      # send emails to backers, developers and followers that the bounty has been increased
      delay.send_bounty_increased_emails
    end

    # if it's a team bounty, add the issue tracker to team
    if owner.is_a?(Team)
      owner.delay.add_tracker(issue.tracker)
    end

    issue.developer_goals.find_each do |goal|
      goal.delay.bounty_created_callback
    end

    MixpanelEvent.track(
      person_id: person_id,
      event: 'Create Order',
      checkout_method: order.checkout_method.class.name,
      issue_id: issue.id,
      product: "bounty",
      amount: amount,
      bounty_expiration: bounty_expiration,
      upon_expiration: upon_expiration,
      promotion: promotion
    )

    self
  end

  # the internal account used to pay for this bounty
  def source_account
    Split.where(item: self).reorder('created_at').first.txn.splits.where('amount < 0').reorder('amount').first.account
  end

  def move_to_issue(new_issue)
    old_issue = self.issue

    # NOTE: technically we could move refunded, just don't move $$ below
    raise "can't move refunded bounty" if refunded?

    # move bounty
    update_attributes(issue_id: new_issue.id)

    # move monies
    transaction = Transaction.build do |tr|
      tr.description = "Move Bounty(#{id}) From ##{old_issue.id} TO ##{new_issue.id}"
      tr.splits.create(amount: -amount, item: old_issue)
      tr.splits.create(amount: +amount, item: new_issue)
    end

    # update caches
    new_issue.update_bounty_total
    old_issue.update_bounty_total
  end

  # Info about Bounties. Included data:
  # count - count of all active bounties that can be claimed (issues with a bounty_total > 0)
  # amount - sum of all active bounty amounts
  # paid - sum of all paid out bounties
  def self.info
    {
      count: active.pluck(:issue_id).uniq.count,
      amount: active.sum(:amount),
      paid: paid.sum(:amount)
    }
  end
end
