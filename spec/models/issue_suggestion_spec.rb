# == Schema Information
#
# Table name: issue_suggestions
#
#  id               :integer          not null, primary key
#  person_id        :integer          not null
#  team_id          :integer          not null
#  issue_id         :integer          not null
#  description      :text
#  created_at       :datetime
#  updated_at       :datetime
#  can_solve        :boolean          default(FALSE), not null
#  thanked_at       :datetime
#  rejected_at      :datetime
#  rejection_reason :text
#

require 'rails_helper'

RSpec.describe IssueSuggestion, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
