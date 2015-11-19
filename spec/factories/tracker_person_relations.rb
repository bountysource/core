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

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :tracker_person_relation do
    association :person, factory: :person
    association :tracker, factory: :tracker
    can_edit true
  end
end
