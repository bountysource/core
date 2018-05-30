# == Schema Information
#
# Table name: person_relations
#
#  id               :integer          not null, primary key
#  type             :string(255)      not null
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

class PersonRelation::BountySource < PersonRelation::Base
end
