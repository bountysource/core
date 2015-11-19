# == Schema Information
#
# Table name: tag_votes
#
#  id              :integer          not null, primary key
#  person_id       :integer          not null
#  value           :integer          default(0), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  tag_relation_id :integer          not null
#
# Indexes
#
#  index_tag_votes_on_tag_relation_id_and_person_id  (tag_relation_id,person_id) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :tag_vote do
    association :person, factory: :person
    association :relation, factory: :tag_relation
    value 0
  end
end
