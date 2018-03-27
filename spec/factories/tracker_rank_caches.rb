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

FactoryBot.define do
  factory :tracker_rank_cache, :class => TrackerRankCache do
    association :tracker, factory: :tracker
    association :person, factory: :person
    rank 1
  end
end
