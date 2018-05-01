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
#  owner_type      :string(255)
#
# Indexes
#
#  index_bounty_claim_responses_on_bounty_claim_id                (bounty_claim_id)
#  index_bounty_claim_responses_on_person_id_and_bounty_claim_id  (person_id,bounty_claim_id) UNIQUE
#

require 'spec_helper'

describe BountyClaimResponse do
  # This is actually pretty well tested in bounty_claim_spec...
end
