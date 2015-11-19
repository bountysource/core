# == Schema Information
#
# Table name: language_person_relations
#
#  id          :integer          not null, primary key
#  person_id   :integer          not null
#  language_id :integer          not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  active      :boolean          default(TRUE), not null
#
# Indexes
#
#  index_language_person_relations_on_language_id                (language_id)
#  index_language_person_relations_on_person_id                  (person_id)
#  index_language_person_relations_on_person_id_and_language_id  (person_id,language_id) UNIQUE
#

class LanguagePersonRelation < ActiveRecord::Base
  attr_accessible :language, :person, :active

  belongs_to :language
  belongs_to :person

  validates :language, presence: true
  validates :person, presence: true
  validates_uniqueness_of :person_id, scope: [:language_id]
end
