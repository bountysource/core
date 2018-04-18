# == Schema Information
#
# Table name: follow_relations
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  item_id    :integer          not null
#  item_type  :string           not null
#  active     :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_follow_relations_on_person_id_and_item_id  (person_id,item_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :follow_relation do
    association :person, factory: :person
  end
end
