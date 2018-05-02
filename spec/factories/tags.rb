# == Schema Information
#
# Table name: tags
#
#  id         :integer          not null, primary key
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  image_url  :string
#
# Indexes
#
#  index_tags_on_name  (name) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :tag do
    sequence(:name) { |n| "tag#{n}" }
  end
end
