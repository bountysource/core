# == Schema Information
#
# Table name: tags
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  image_url  :string(255)
#
# Indexes
#
#  index_tags_on_name  (name) UNIQUE
#

class Tag < ApplicationRecord
  has_many :child_tag_relations, as: :child, class_name: 'TagRelation'

  ROUTE_REGEX = /[a-zA-Z0-9\.\-_\+#]+/
  NAME_REGEX = /^#{ROUTE_REGEX}$/

  validates :name,
    presence:   true,
    uniqueness: true,
    length: {
      minimum: 1,
      maximum: 25
    }

  def delete_after_merging_into!(good_model)
    TagRelation.merge_two_tags(good_model, self)
    self.delete
  end

end
