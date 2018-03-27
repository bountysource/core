# == Schema Information
#
# Table name: fundraiser_tracker_relations
#
#  id            :integer          not null, primary key
#  fundraiser_id :integer          not null
#  tracker_id    :integer          not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#
# Indexes
#
#  index_fundraiser_tracker_relations_on_ids  (fundraiser_id,tracker_id) UNIQUE
#

class FundraiserTrackerRelation < ActiveRecord::Base
  belongs_to :fundraiser
  belongs_to :tracker

  validates :fundraiser_id, presence: true
  validates :tracker_id, presence: true, uniqueness: { scope: :fundraiser_id }
end
