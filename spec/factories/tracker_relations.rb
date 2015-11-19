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

FactoryGirl.define do
  factory :tracker_relation, class: TrackerRelation do
    association :linked_account, factory: :linked_account
    association :tracker, factory: :tracker

    factory :tracker_committer_relation do
      type 'TrackerRelation::Committer'
    end

    factory :tracker_owner_relation do
      type 'TrackerRelation::Owner'
    end

    factory :tracker_org_member_relation do
      type 'TrackerRelation::OrganizationMember'
    end
  end
end
