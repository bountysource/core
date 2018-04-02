# == Schema Information
#
# Table name: tracker_language_relations
#
#  id          :integer          not null, primary key
#  tracker_id  :integer          not null
#  language_id :integer          not null
#  bytes       :integer
#  synced_at   :datetime
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_tracker_language_relations_on_tracker_id_and_language_id  (tracker_id,language_id) UNIQUE
#

class TrackerLanguageRelation < ApplicationRecord
  belongs_to :tracker
  belongs_to :language

  validates :tracker, presence: true
  validates :language, presence: true
  validates_uniqueness_of :tracker_id, scope: [:language_id]
end
