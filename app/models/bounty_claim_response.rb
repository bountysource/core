# == Schema Information
#
# Table name: bounty_claim_responses
#
#  id              :integer          not null, primary key
#  person_id       :integer          not null
#  bounty_claim_id :integer          not null
#  value           :boolean
#  description     :text
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  anonymous       :boolean          default(FALSE), not null
#  owner_id        :integer
#  owner_type      :string
#
# Indexes
#
#  index_bounty_claim_responses_on_bounty_claim_id                (bounty_claim_id)
#  index_bounty_claim_responses_on_person_id_and_bounty_claim_id  (person_id,bounty_claim_id) UNIQUE
#

class BountyClaimResponse < ApplicationRecord
  has_owner

  belongs_to  :person
  belongs_to  :bounty_claim
  has_one     :issue, through: :bounty_claim
  has_one     :pact, through: :bounty_claim

  validates :person, presence: true
  validates :bounty_claim, presence: true
  validates_uniqueness_of :person_id, scope: :bounty_claim_id

  # require a description for rejections
  validates :description, presence: true, if: lambda { reject? }

  # find or create. update with new value if found and it's different.
  # after creating or updating the model, checks to see if the BountyClaim is
  # immediately acceptable (unanimous approval by backers)
  def self.find_or_create_by_claim_and_person(bounty_claim, person, value=nil, description=nil)
    response = find_or_create_by(bounty_claim_id: bounty_claim.id, person_id: person.id)

    response.value = value
    response.description = description
    response.anonymous = BountyClaimResponse.set_anonymity(bounty_claim, person)

    # email backers and developer if it is now disputed
    if response.reject?
      # backers, unless backer is the developer...
      if bounty_claim.issue
        backers = bounty_claim.issue.backers
      elsif bounty_claim.pact
        backers = bounty_claim.pact.backers
      end

      backers.each do |backer|
        if backer != bounty_claim.person
          backer.send_email(:bounty_claim_rejected_backer_notice, bounty_claim: bounty_claim, response: response)
        end
      end

      # developer
      bounty_claim.person.send_email(:bounty_claim_rejected_developer_notice, bounty_claim: bounty_claim, response: response)
    end

    response.save!

    # update disputed flag on claim
    response.bounty_claim.update_attribute :disputed, (response.reject? || response.bounty_claim.disputed?)

    # automatically collect if unanimously accepted
    response.bounty_claim.collect! if response.bounty_claim.unanimously_accepted?

    response
  end

  def accept?
    value == true
  end

  def reject?
    value == false
  end

  def neutral?
    value.nil?
  end

  def self.set_anonymity(bounty_claim, person)
    if bounty_claim.issue
      persons_bounties = bounty_claim.issue.bounties.where(person_id: person.id)
    elsif bounty_claim.pact
      persons_bounties = bounty_claim.pact.bounties.where(person_id: person.id)
    end

    if persons_bounties.pluck(:anonymous).include?(true)
      true
    else
      false
    end
  end
end
