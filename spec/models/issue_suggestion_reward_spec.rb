# == Schema Information
#
# Table name: issue_suggestion_rewards
#
#  id                  :integer          not null, primary key
#  issue_suggestion_id :integer          not null
#  person_id           :integer          not null
#  amount              :decimal(10, 2)   not null
#  created_at          :datetime
#  updated_at          :datetime
#

require 'rails_helper'

RSpec.describe IssueSuggestionReward, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
