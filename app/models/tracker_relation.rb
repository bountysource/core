# == Schema Information
#
# Table name: tracker_relations
#
#  id                :integer          not null, primary key
#  tracker_id        :integer          not null
#  linked_account_id :integer          not null
#  type              :string(255)      not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_tracker_relations_on_linked_account_id  (linked_account_id)
#  index_tracker_relations_on_tracker_id         (tracker_id)
#

class TrackerRelation < ActiveRecord::Base
  belongs_to  :tracker
  belongs_to  :linked_account, class_name: 'LinkedAccount::Base'
  has_one     :person, through: :linked_account

  # turn type into a pretty name
  def pretty_type
    case self
    when TrackerRelation::Owner then "owner"
    when TrackerRelation::Committer then "committer"
    when TrackerRelation::OrganizationMember then "member"
    else nil
    end
  end
end
