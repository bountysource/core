# == Schema Information
#
# Table name: proposals
#
#  id                      :integer          not null, primary key
#  request_for_proposal_id :integer          not null
#  person_id               :integer          not null
#  amount                  :decimal(10, 2)   not null
#  estimated_work          :integer
#  bio                     :string(1000)
#  state                   :string           default("pending")
#  created_at              :datetime
#  updated_at              :datetime
#  completed_by            :datetime
#  team_notes              :text
#
# Indexes
#
#  index_proposals_on_amount                                 (amount)
#  index_proposals_on_person_id                              (person_id)
#  index_proposals_on_person_id_and_request_for_proposal_id  (person_id,request_for_proposal_id) UNIQUE
#  index_proposals_on_request_for_proposal_id                (request_for_proposal_id)
#

class Proposal < ApplicationRecord
  include AASM

  validates :request_for_proposal, presence: true
  validates :person, presence: true
  validates :amount, numericality: { greater_than_or_equal_to: 0 }
  validates :bio, length: { maximum: 1000 }
  validates_uniqueness_of :person_id, scope: :request_for_proposal_id
  validate :able_to_create, on: :create

  after_create :send_submitted_email_to_team

  belongs_to :person
  belongs_to :request_for_proposal
  has_one :issue, :through => :request_for_proposal
  has_one :tracker, :through => :issue

  delegate :account, to: :request_for_proposal
  delegate :pending_proposals, to: :request_for_proposal

  before_destroy do
    throw(:abort) unless destroyable?
  end

  aasm column: 'state' do
    state :pending, initial: true
    state :pending_appointment
    state :appointed
    state :pending_approval
    state :approved
    state :rejected

    # Team adds Proposal to ShoppingCart, but has not yet paid the bid amount into RFP account.
    event :begin_appointment do
      transitions from: :pending, to: :pending_appointment

      after do
        begin_fulfillment_of_request_for_proposal!
      end
    end

    # Team removes Proposal from ShoppingCart.
    event :reverse_appointment do
      transitions from: :pending_appointment, to: :pending

      after do
        reverse_fulfillment_of_request_for_proposal!
        reset_team_notes!
      end
    end

    event :appoint do
      transitions from: :pending_appointment, to: :appointed

      after do
        send_appointed_email

        # TODO email team on appointment
        # send_appointed_email_to_team
      end
    end

    # Team rejects pending Proposal.
    event :reject do
      transitions from: :pending, to: :rejected

      after do
        send_rejection_email

        # TODO email team on rejection
        # send_rejection_email_to_team
      end
    end

    # The Proposal owner has finished working on
    # their solution to the Issue.
    event :begin_approval do
      transitions from: :appointed, to: :pending_approval
    end

    # Team disapproves of the appointed Proposal.
    # Require the Proposal owner to mark as completed again.
    event :reverse_approval do
      transitions from: :pending_approval, to: :appointed
    end

    # Team approves of solution that Proposal owner
    # has submitted.
    event :approve do
      transitions from: :pending_approval, to: :approved

      after do
        fulfill_request_for_proposal!
        reject_other_pending_proposals!
        send_approval_email
      end
    end
  end

  def after_purchase(order)
    appoint!
    # notify other admins/developers on the team
    request_for_proposal.notify_admins_and_developers
  end

  def managing_team
    issue.team
  end

  def create_account
    request_for_proposal.account || request_for_proposal.create_account!
  end

  # Get all other Proposals for the RFP
  def other_proposals
    request_for_proposal.proposals.where('id != ?', id)
  end

  def set_team_notes!(notes)
    update_attributes!(team_notes: notes)
  end

  private

  def destroyable?
    pending? || pending_appointment? || rejected?
  end

  def able_to_create
    unless request_for_proposal.try(:pending?)
      errors.add(:request_for_proposal, "is not accepting proposals")
    end
  end

  # Team members that are admin and/or developer. returns Array
  def team_members
    team = request_for_proposal.team
    team.admins + team.developers
  end

  def send_submitted_email_to_team
    team_members.each { |person| person.delay.send_email(:proposal_created_to_team, proposal: self) }
  end

  # TODO fill template with content
  def send_appointed_email_to_team
    team_members.each { |person| person.delay.send_email(:proposal_appointed_to_team, proposal: self) }
  end

  # TODO fill template with content
  def send_rejection_email_to_team
    team_members.each { |person| person.delay.send_email(:proposal_rejected_to_team, proposal: self) }
  end

  def send_appointed_email
    person.send_email(:proposal_appointed, proposal: self)
  end

  # TODO proposal approved email
  def send_approval_email
    # person.send_email(:proposal_approved, proposal: self)
  end

  def send_rejection_email
    person.send_email(:proposal_rejected, proposal: self)
  end

  # Reject all proposals that are not self
  def reject_other_pending_proposals!
    # TODO find_each would be better
    other_proposals.pending.each(&:reject!)
  end

  def begin_fulfillment_of_request_for_proposal!
    request_for_proposal.begin_fulfillment!
  end

  def reverse_fulfillment_of_request_for_proposal!
    request_for_proposal.reverse_fulfillment!
  end

  def fulfill_request_for_proposal!
    request_for_proposal.fulfill!
  end

  def reset_team_notes!
    set_team_notes!(nil)
  end
end
