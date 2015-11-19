# == Schema Information
#
# Table name: team_bounty_hunters
#
#  id           :integer          not null, primary key
#  person_id    :integer          not null
#  team_id      :integer          not null
#  opted_out_at :datetime
#  created_at   :datetime
#  updated_at   :datetime
#

require 'rails_helper'

RSpec.describe TeamBountyHunter, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
