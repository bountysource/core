# == Schema Information
#
# Table name: person_relations
#
#  id               :integer          not null, primary key
#  type             :string           not null
#  person_id        :integer          not null
#  target_person_id :integer          not null
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#
# Indexes
#
#  index_person_relations_on_person_id         (person_id)
#  index_person_relations_on_target_person_id  (target_person_id)
#  index_person_relations_on_type_and_people   (type,person_id,target_person_id) UNIQUE
#

FactoryBot.define do
  factory :person_relation, class: PersonRelation::Base do
    association :person,        factory: :person
    association :target_person, factory: :person

    factory :person_relation_facebook, class: PersonRelation::Facebook do
      type 'PersonRelation::Facebook'
    end

    factory :person_relation_twitter, class: PersonRelation::Twitter do
      type 'PersonRelation::Twitter'
    end

    factory :person_relation_github, class: PersonRelation::Github do
      type 'PersonRelation::Github'
    end
  end
end
