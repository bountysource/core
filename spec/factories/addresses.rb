# == Schema Information
#
# Table name: addresses
#
#  id          :integer          not null, primary key
#  person_id   :integer
#  name        :string
#  address1    :string
#  address2    :string
#  address3    :string
#  city        :string
#  state       :string
#  postal_code :string
#  country     :string
#  created_at  :datetime
#  updated_at  :datetime
#
# Indexes
#
#  index_addresses_on_person_id  (person_id)
#

FactoryBot.define do
  factory :address, class: Address do
    name 'Robert Paulson'
    address1 '123 Fake Street'
    address2 'Ste. 1200'
    city 'Portland'
    state 'Oregon'
    postal_code '12345'
    country 'US'
  end
end
