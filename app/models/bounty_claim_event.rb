# == Schema Information
#
# Table name: bounty_claim_events
#
#  id              :integer          not null, primary key
#  type            :string           not null
#  bounty_claim_id :integer          not null
#  person_id       :integer
#  description     :text
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#
# Indexes
#
#  index_bounty_claim_events_on_bounty_claim_id  (bounty_claim_id)
#  index_bounty_claim_events_on_person_id        (person_id)
#

class BountyClaimEvent < ApplicationRecord
  validates :bounty_claim, presence: true

  belongs_to :bounty_claim
  belongs_to :person

  scope :collected, lambda { where(type: "BountyClaimEvent::Collected") }
end
