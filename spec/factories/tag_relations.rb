# == Schema Information
#
# Table name: tag_relations
#
#  id          :integer          not null, primary key
#  parent_id   :integer          not null
#  parent_type :string           not null
#  child_id    :integer          not null
#  child_type  :string           not null
#  weight      :integer          default(0), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_tag_relations_on_child_and_parent         (parent_id,parent_type,child_id,child_type) UNIQUE
#  index_tag_relations_on_child_id_and_child_type  (child_id,child_type)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :tag_relation do
    association :parent, factory: :team
    association :child, factory: :tag
    weight 1
  end
end
