# == Schema Information
#
# Table name: request_for_proposals
#
#  id         :integer          not null, primary key
#  issue_id   :integer
#  budget     :decimal(10, 2)
#  due_date   :date
#  created_at :datetime
#  updated_at :datetime
#  person_id  :integer          not null
#  state      :string(255)      default("pending")
#  abstract   :string(1000)
#
# Indexes
#
#  index_request_for_proposals_on_budget     (budget)
#  index_request_for_proposals_on_issue_id   (issue_id)
#  index_request_for_proposals_on_person_id  (person_id)
#

class RequestForProposal < ActiveRecord::Base
  include AASM
  attr_accessible :abstract, :due_date, :budget, :issue, :person

  validates :issue, presence: true
  validates :budget, numericality: { greater_than_or_equal_to: 0 }, allow_blank: true

  has_account class_name: "Account::RequestForProposal"

  belongs_to :person
  belongs_to :issue
  has_one :tracker, :through => :issue
  has_many :proposals
  delegate :team, to: :issue

  aasm column: 'state' do
    state :pending, initial: true
    state :pending_fulfillment
    state :fulfilled

    event :begin_fulfillment do
      transitions from: :pending, to: :pending_fulfillment
    end

    event :reverse_fulfillment do
      transitions from: :pending_fulfillment, to: :pending
    end

    event :fulfill do
      transitions from: :pending_fulfillment, to: :fulfilled
    end
  end

  def pending_proposals
    proposals.pending
  end

  def notify_admins_and_developers
    team.admins_and_developers.each { |member| member.send_email(:member_accepted_proposal) }
  end

  # Person can manage this RFP.
  # 1. A team manages the issue tracker
  # 2. The team has RFP enabled
  # 3. Person is a member of the team as an admin or developer
  def person_can_manage?(person)
    team && team.rfp_enabled? && begin
      rel = team.member_relations.find_by(person: person)
      rel.present? && (rel.developer? || rel.admin?)
    end
  end
end
