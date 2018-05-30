# == Schema Information
#
# Table name: team_payins
#
#  id          :integer          not null, primary key
#  team_id     :integer          not null
#  amount      :decimal(, )      not null
#  person_id   :integer
#  consumed    :boolean          default(FALSE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  owner_type  :string(255)
#  owner_id    :integer
#  from_member :boolean          default(FALSE)
#  refunded_at :datetime
#
# Indexes
#
#  index_team_payins_on_amount                   (amount)
#  index_team_payins_on_owner_type_and_owner_id  (owner_type,owner_id)
#  index_team_payins_on_person_id                (person_id)
#  index_team_payins_on_refunded_at              (refunded_at) WHERE (refunded_at IS NOT NULL)
#  index_team_payins_on_team_id                  (team_id)
#

class TeamPayin < ApplicationRecord
  belongs_to :team
  belongs_to :person
  has_owner

  has_one :account, through: :team

  validates :amount, numericality: { greater_than: 0 }
  validates :team, presence: true

  before_create :set_from_member

  scope :created_this_month, lambda { |period=Time.now| where(created_at: period.beginning_of_month..period.end_of_month) }
  scope :not_from_members, lambda { where(from_member: false) }
  scope :not_refunded, lambda { where(refunded_at: nil) }

  # Invoked after the item is created through Transaction
  def after_purchase(order)
    self.consumed = true
    # send confirmation email to admin and to user, #person.send_email already delays
    notify_admins
    notify_backer
    save!

    MixpanelEvent.track(
      person_id: person_id,
      event: 'Create Order',
      checkout_method: order.checkout_method.class.name,
      product: "team_payin",
      amount: amount,
      team_id: team.id,
      member: team.person_is_member?(person)
    )
  end

  # These notification methods AND the mixpanel events should be moved into a ServiceObject
  def notify_admins
    team.admins.each do |admin|
      admin.send_email(:team_account_funded_admin, team_payin: self) unless admin.id == person.id
    end
  end

  def notify_backer
    person.send_email(:team_account_funded_backer, team_payin: self)
  end

  after_commit do
    team.update_financial_cache_counters

    team_ids = []
    team_ids << owner_id if owner_type == 'Team'
    team_ids << previous_changes[:owner_id] if previous_changes[:owner_id] && (previous_changes[:owner_type] || owner_type) == 'Team'
    team_ids << team_id
    Team.where(id: team_ids.compact.uniq).each(&:update_activity_total)
  end

  def create_account
    team.create_account
  end

  def set_from_member
    self.from_member = true if self.person_id && team.member_relations.where(person_id: self.person_id).exists?
  end

  def refunded?
    !refunded_at.nil?
  end

  def refundable?
    !refunded?
  end

  def refund!
    self.class.transaction do
      raise "Already refunded" unless reload.refundable?

      transaction = Transaction.build do |tr|
        tr.description = "Refund TeamPayin(#{id}) - Amount: $#{amount} Refunded: $#{amount}"
        tr.splits.create(amount: -amount, item: team)
        if owner_type == "Team"
          tr.splits.create(amount: +amount, item: owner)
        else
          tr.splits.create(amount: +amount, item: person)
        end
      end

      transaction or raise ActiveRecord::Rollback

      # update bounty to 'refunded' status or rollback
      update_attributes refunded_at: Time.now or raise ActiveRecord::Rollback

      # email the backer
      person.send_email :team_payin_refunded, team_payin: self

      # update displayed bounty total on issue
      team.update_financial_cache_counters
      owner.update_activity_total if owner.is_a?(Team)
    end
  end


end
