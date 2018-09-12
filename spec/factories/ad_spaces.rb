# == Schema Information
#
# Table name: ad_spaces
#
#  id            :bigint(8)        not null, primary key
#  cloudinary_id :string
#  title         :string
#  text          :text
#  button_text   :string
#  button_url    :string
#  position      :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

FactoryBot.define do
  factory :ad_space do
    title "CanWork"
    text  "The decentralised space for freelancers. The lowest fees. The best talent."
    button_text "Join Now"
    cloudinary_id "test"
  end
end
