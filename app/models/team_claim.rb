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
#  created_at     :datetime
#  updated_at     :datetime
#

class TeamClaim < ApplicationRecord
  belongs_to :person
  belongs_to :team
end
