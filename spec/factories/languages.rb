# == Schema Information
#
# Table name: languages
#
#  id            :integer          not null, primary key
#  name          :string           not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  search_weight :integer
#
# Indexes
#
#  index_languages_on_name  (name) UNIQUE
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :language do
    name "Ruby"
  end
end
