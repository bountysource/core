# == Schema Information
#
# Table name: tracker_relations
#
#  id                :integer          not null, primary key
#  tracker_id        :integer          not null
#  linked_account_id :integer          not null
#  type              :string           not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_tracker_relations_on_linked_account_id  (linked_account_id)
#  index_tracker_relations_on_tracker_id         (tracker_id)
#

class TrackerRelation::OrganizationMember < TrackerRelation
end
