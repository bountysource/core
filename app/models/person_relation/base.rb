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

class PersonRelation::Base < ActiveRecord::Base
  self.table_name = 'person_relations'

  validates :person, presence: true
  validates :target_person, presence: true
  validates_uniqueness_of :person_id, scope: :target_person_id

  belongs_to :person
  belongs_to :target_person, class_name: 'Person'
end
