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

class TeamBountyHunter < ActiveRecord::Base
  belongs_to :person
  belongs_to :team

  scope :active, lambda { where(opted_out_at: nil) }

end
