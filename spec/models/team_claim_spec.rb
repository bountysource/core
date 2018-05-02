# == Schema Information
#
# Table name: team_claims
#
#  id             :integer          not null, primary key
#  person_id      :integer          not null
#  team_id        :integer          not null
#  claim_notes    :text
#  rejected_notes :text
#  accepted_at    :datetime
#  rejected_at    :datetime
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#

require 'rails_helper'

RSpec.describe TeamClaim, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
