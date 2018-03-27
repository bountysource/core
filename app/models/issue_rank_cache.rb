# == Schema Information
#
# Table name: issue_rank_caches
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  issue_id   :integer          not null
#  rank       :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_issue_rank_caches_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

class IssueRankCache < ActiveRecord::Base
  validates :issue_id, presence: true
  validates :person_id, presence: true, uniqueness: { scope: :issue_id}
  validates :rank, presence: true

  belongs_to :issue
  belongs_to :person

  class Error < StandardError; end

  def self.update_cache(activity_log)
    issue_rank_cache = IssueRankCache.where(person_id: activity_log.person_id, issue_id: activity_log.issue_id).first

    if issue_rank_cache.nil?
      issue_rank_cache = IssueRankCache.create!(person_id: activity_log.person_id, issue_id: activity_log.issue_id, rank: 1)
    elsif issue_rank_cache.updated_at < 5.seconds.ago
      issue_rank = ActivityLog.where(person_id: activity_log.person_id, issue_id: activity_log.issue_id).count
      issue_rank_cache.rank = issue_rank
      issue_rank_cache.save!
    end
  end

end
