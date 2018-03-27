# == Schema Information
#
# Table name: team_activity_inclusions
#
#  id             :integer          not null, primary key
#  parent_team_id :integer          not null
#  child_team_id  :integer          not null
#  created_at     :datetime
#  updated_at     :datetime
#
# Indexes
#
#  index_team_activity_inclusions_on_child_team_id   (child_team_id)
#  index_team_activity_inclusions_on_parent_team_id  (parent_team_id)
#

class TeamActivityInclusion < ActiveRecord::Base
  belongs_to :parent_team, class_name: 'Team'
  belongs_to :child_team, class_name: 'Team'

  after_commit do
    team_ids = []
    team_ids << parent_team_id
    team_ids << child_team_id
    team_ids << previous_changes[:parent_team_id]
    team_ids << previous_changes[:child_team_id]
    Team.where(id: team_ids.compact.uniq).each(&:update_activity_total)
  end
end
