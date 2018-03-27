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

FactoryBot.define do
  factory :team_tracker_relation, class: TeamTrackerRelation do
    association :team, factory: :team
    association :tracker, factory: :team
  end
end
