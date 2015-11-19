# == Schema Information
#
# Table name: team_tracker_relations
#
#  id         :integer          not null, primary key
#  team_id    :integer          not null
#  tracker_id :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_team_tracker_relations_on_team_id                 (team_id)
#  index_team_tracker_relations_on_team_id_and_tracker_id  (team_id,tracker_id) UNIQUE
#  index_team_tracker_relations_on_tracker_id              (tracker_id)
#

class TeamTrackerRelation < ActiveRecord::Base

  attr_accessible :team, :tracker

  has_owner
  belongs_to :team
  belongs_to :tracker
  belongs_to :owner, polymorphic: true

  validates_uniqueness_of :team_id, scope: :tracker_id

end
