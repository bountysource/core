# == Schema Information
#
# Table name: bounty_claims
#
#  id          :integer          not null, primary key
#  person_id   :integer          not null
#  issue_id    :integer          not null
#  number      :integer
#  code_url    :string(255)
#  description :text
#  collected   :boolean
#  disputed    :boolean          default(FALSE), not null
#  paid_out    :boolean          default(FALSE), not null
#  rejected    :boolean          default(FALSE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  amount      :decimal(, )      default(0.0), not null
#
# Indexes
#
#  index_bounty_claims_on_issue_id                (issue_id)
#  index_bounty_claims_on_person_id               (person_id)
#  index_bounty_claims_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

class BountyClaim < ApplicationRecord
  belongs_to :person
  belongs_to :issue
  has_many :bounty_claim_responses
  has_many :bounty_claim_events

  validates :person, presence: true
  validates :issue, presence: true

  # uses the custom URL validator defined in app/validators/url_validator.rb
  #validates :code_url, url: true, if: lambda { code_url.present? }

  validates_uniqueness_of :issue_id, scope: :person_id

  scope :paid_out, -> { where(paid_out: true) }
  scope :collected, -> { where(collected: true) }

  # add number before creation. i.e. Bounty Claim #1
  before_create { self.number = issue.bounty_claims.count + 1 }
  after_create { self.person.is_bounty_hunter!(issue: self.issue) }

  # send email to backers and the developer after creation
  after_create do
    person.send_email(:bounty_claim_submitted_developer_notice, bounty_claim: self)
    issue.backers.each { |backer| backer.send_email(:bounty_claim_submitted_backer_notice, bounty_claim: self) }
  end

  # if the creation of this claim contested the bounty, send emails
  after_commit do
    if contested?
      issue.developers.each { |developer| developer.send_email(:bounty_claim_contested_developer_notice, bounty_claim: self) }
      issue.backers.each { |backer| backer.send_email(:bounty_claim_contested_backer_notice, bounty_claim: self) }
    end
  end

  validate do
    #Rails.logger.error "HI THERE: #{self.id} -- #{issue.inspect}"
    # require the issue to be closed, unless it's generic
    if !issue.generic? && issue.can_add_bounty?
      errors.add(:issue, 'not closed')
    end

    # invalidate if another claim won
    if new_record? && issue && !self.class.where(issue_id: issue.id, collected: true).empty?
      errors.add(:issue, 'bounty already claimed')
    end

    # require code_url AND/OR description to be present
    if code_url.blank? && description.blank?
      errors.add(:base, "Must provide code_url and/or description")
    end

    if issue.crypto? && !person.has_verified_primary_wallet?
      errors.add(:person, "must have a verified primary wallet to submit a claim for a crypto bounty")
    end

    errors.empty?
  end

  # cannot destroy an accepted claim!:
  before_destroy do
    errors.add(:base, "Cannot destroy accepted bounty claim") if collected?
    throw(:abort) unless errors.empty?
  end

  class BountyClaimError < StandardError; end
  class BountyContested < BountyClaimError; end
  class CollectionError < BountyClaimError; end
  class PayoutError < BountyClaimError; end

  # backer can accept a claim to expedite the acceptance.
  # Note: 100% approval rate automatically accepts the claim,
  # bypassing the 2 week dispute period
  def accept!(person, message=nil)
    if (in_dispute_period? || contested?) && person_can_respond?(person) && response_for(person) != true
      message = nil if message.blank?
      self.class.transaction do
        BountyClaimEvent::BackerAccepted.create!(
          bounty_claim: self,
          person: person,
          description: message
        )
        response = BountyClaimResponse.find_or_create_by_claim_and_person(self, person, true, message)

        self.reload
      end
    end
  end

  # backer can reject a claim to halt automatic acceptance after 2 weeks.
  # Note: 100% this will block acceptance after the 2 week dispute period
  # ends.
  def reject!(person, reason)
    if (in_dispute_period? || contested?) && person_can_respond?(person) && response_for(person) != false
      self.class.transaction do
        BountyClaimEvent::BackerDisputed.create!(
          bounty_claim: self,
          person: person,
          description: reason
        )
        BountyClaimResponse.find_or_create_by_claim_and_person(self, person, false, reason) and reload
      end
    end
  end

  # backer can resolve a dispute that they made, with a reason.
  def resolve!(person, reason)
    if person_can_respond?(person) && response_for(person) == false
      self.class.transaction do
        BountyClaimEvent::BackerDisputeResolved.create!(
          bounty_claim: self,
          person: person,
          description: reason
        )
        BountyClaimResponse.find_or_create_by_claim_and_person(self, person, true, reason) and reload
      end
    end
  end

  # reset the value of the response for the bounty.
  def reset!(person, reason=nil)
    if (in_dispute_period? || contested?) && person_can_respond?(person) && !response_for(person).nil?
      BountyClaimResponse.find_or_create_by_claim_and_person(self, person, nil, reason) and reload
    end
  end

  def accepted_responses
    bounty_claim_responses.where(value: true)
  end

  def accepted_responses_with_messages
    accepted_responses.map { |response| response.description.present? ? response : nil }.compact
  end

  def accept_count
    accepted_responses.count
  end

  def reject_count
    bounty_claim_responses.where(value: false).count
  end

  def backers_count
    issue.backers.count
  end

  def responsive_backers
    Person.active.find(bounty_claim_responses.pluck(:person_id))
  end

  def unresponsive_backers
    issue.backers - responsive_backers
  end

  # a claim is disputed if one or more of the backers rejected it.
  # Note: possible values for a bounty claim response:
  # nil - carries no weight, default state.
  # true - backer approved the claim
  # false - backer rejected the claim
  def disputed?
    !bounty_claim_responses.where(value: false).empty?
  end

  # is there more than one claim on the issue?
  def contested?
    self.class.where(issue_id: issue.id).count > 1
  end

  def dispute_period_ends_at
    created_at + Api::Application.config.dispute_period_length
  end

  def in_dispute_period?
    !collected? && !rejected? && dispute_period_ends_at > DateTime.now
  end

  # find claims that have not been collected, disputed, contested, or rejected.
  def self.in_dispute_period
    where(collected: false, rejected: false).where("bounty_claims.created_at >= :dispute_period_ends", dispute_period_ends: DateTime.now - Api::Application.config.dispute_period_length)
  end

  # have all of the backers voted, and are all votes for accepting the claim?
  def unanimously_accepted?
    if issue.fiat?
      issue.bounties.pluck(:person_id).uniq.count == bounty_claim_responses.where(value: true).count
    elsif issue.crypto?
      issue.crypto_bounties.pluck(:owner_id).uniq.reject(&:nil?).count == bounty_claim_responses.where(value: true).count
    end
  end

  # A bounty claim is deemed acceptable if 100% of the backers
  # approve it, or if it has cleared the dispute period, and has not been rejected.
  # NOTE: checking collected.nil? instead of collected? on purpose!!!
  #   `nil` means that no claim has been collected
  #   `false` means that ANOTHER claim was collected.
  def collectible?
    !collected? && (unanimously_accepted? || !in_dispute_period?) && !contested?
  end

  # award person the bounty!
  # Note: the collected flag has 3 states:
  #   * nil - claim made, nothing has happened yet
  #   * true - claim was accepted
  #   * false - claim was rejected, possible because another claim was accepted.
  def collect!
    return nil if collected? || paid_out?

    self.class.transaction do
      update_attribute :collected, true

      # set ALL OTHER bounty claims from nil to false, and reject
      issue.bounty_claims.each { |bounty_claim| bounty_claim.update_attributes!(collected: false, rejected: true) unless bounty_claim == self }

      # set issue to paid_out
      issue.update_attribute(:paid_out, true)

      # create event
      BountyClaimEvent::Collected.create!(bounty_claim: self)
      if issue.fiat?
        #set bounty_claim.amount to the sum of all the bounties that have been set to paid -- this will not handle paying out claims multiple times..
        payout_amount = issue.bounties.where(status: Bounty::Status::ACTIVE).sum(:amount)
        update_attribute :amount, payout_amount

        #update active bounties' status to paid (not refunded)
        issue.bounties.active.update_all(status: Bounty::Status::PAID)

        # payout! it raises on its own if something goes wrong
        payout! if payout_amount > 0
      else
        CryptoPayOut.create(issue: issue, person: person, type: 'ETH::Payout')
      end


      # update email template, email backers of bounty claim
      issue.backers.find_each { |backer| backer.send_email(:bounty_claim_accepted_backer_notice, bounty_claim: self) }

      # email developer that his/her claim has been collected, with messages from backers
      person.send_email(:bounty_claim_accepted_developer_notice, bounty_claim: self, responses: accepted_responses_with_messages)

      

      MixpanelEvent.track(
        person_id: person_id,
        event: 'Awarded Bounty Claim',
        issue_id: issue_id,
        type: unanimously_accepted? ? 'vote' : 'time'
      )
    end

    issue.update_bounty_total

    self
  end

  # can this person respond to the claim?
  # that is, did the person place a bounty on the issue?
  # OR is this person a developer of a team that created a bounty
  def person_can_respond?(person)
    issue.can_respond_to_claims?(person)
  end

  # get the response for a person.
  # make sure the person actually voted before checking this,
  # because a nil value might mean that they reset their response.
  def response_for(person)
    raise "Person is not a backer" unless person_can_respond?(person)
    response = bounty_claim_responses.find_by_person_id(person.id)
    response.try(:value)
  end

  # find claims that can automatically be accepted
  def self.accept_eligible!
    # find all claims that are out of the dispute period, neither disputed, rejected, nor collected.
    claims = where("disputed = false AND rejected = false AND (collected IS NULL OR collected = false) AND created_at <= :date", date: (DateTime.now - Api::Application.config.dispute_period_length))

    # claim it if it's claimable
    claims.each { |claim| claim.collect! if claim.collectible? }
  end

  # build the transaction to move money from issue to person
  def payout!
    transaction = nil

    ApplicationRecord.transaction do
      lock! # Protect against potential race conditions

      raise PayoutError, 'already paid out' if paid_out?

      'Transaction::InternalTransfer::BountyClaim'.constantize # because rails autoloading, that's why.
      transaction = Transaction::InternalTransfer::BountyClaim.create! description: "Payout BountyClaim(#{id}) - Total: $#{amount}"

      transaction.splits.create(
        amount: -1 * amount,
        item: issue
      )

      transaction.splits.create(
        amount: amount,
        item: person
      )

      unless transaction.valid?
        raise PayoutError, transaction.errors.full_messages.to_sentence
      end

      update_attribute :paid_out, true
    end

    transaction
  end

end
