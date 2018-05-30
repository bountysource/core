# == Schema Information
#
# Table name: languages
#
#  id            :integer          not null, primary key
#  name          :string(255)      not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  search_weight :integer
#
# Indexes
#
#  index_languages_on_name  (name) UNIQUE
#

class Language < ApplicationRecord
  has_many :tracker_relations, class_name: "TrackerLanguageRelation"
  has_many :trackers, through: :tracker_relations

  validates :name, uniqueness: true, presence: true

end
