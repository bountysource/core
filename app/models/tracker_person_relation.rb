# == Schema Information
#
# Table name: tracker_person_relations
#
#  id         :integer          not null, primary key
#  tracker_id :integer          not null
#  person_id  :integer          not null
#  can_edit   :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_tracker_person_relations_on_tracker_id_and_person_id  (tracker_id,person_id) UNIQUE
#

class TrackerPersonRelation < ActiveRecord::Base
  attr_accessible :can_edit, :person, :tracker
  belongs_to :person
  belongs_to :tracker

  validates :can_edit, inclusion: { in: [true, false] }
  validates :person_id, presence: true, uniqueness: { scope: :tracker_id }
  validates :tracker, presence: true

  def self.find_or_create(tracker, person)
    TrackerPersonRelation.where(tracker_id: tracker.id, person_id: person.id).first_or_create
  end
end
