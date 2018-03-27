# == Schema Information
#
# Table name: searches
#
#  id         :integer          not null, primary key
#  query      :string(255)      not null
#  person_id  :integer
#  created_at :datetime         not null
#  params     :text             default("--- {}\n")
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :search do
    query "jquery"
  end
end
