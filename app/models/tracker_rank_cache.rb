# == Schema Information
#
# Table name: tracker_rank_caches
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  tracker_id :integer          not null
#  rank       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_tracker_rank_caches_on_person_id_and_tracker_id  (person_id,tracker_id) UNIQUE
#

class TrackerRankCache < ActiveRecord::Base
  attr_accessible :tracker_id, :person_id, :rank

  validates :tracker_id, presence: true
  validates :person_id, presence: true, uniqueness: { scope: :tracker_id}
  validates :rank, presence: true

  belongs_to :person
  belongs_to :tracker

  class Error < StandardError; end

  def self.update_cache(activity_log)
    #activity_log object will always have a tracker
    tracker_rank_cache = TrackerRankCache.where(person_id: activity_log.person_id, tracker_id: activity_log.tracker_id).first

    if tracker_rank_cache.nil?
      tracker_rank_cache = TrackerRankCache.create(person_id: activity_log.person_id, tracker_id: activity_log.tracker_id, rank: 1)
      raise Error unless tracker_rank_cache
    elsif tracker_rank_cache.updated_at < 5.seconds.ago
      tracker_rank = ActivityLog.where(person_id: activity_log.person_id, tracker_id: activity_log.tracker_id).count
      tracker_rank_cache.rank = tracker_rank
      raise Error unless tracker_rank_cache.save
    end
  end
end
