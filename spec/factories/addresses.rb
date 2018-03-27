# == Schema Information
#
# Table name: addresses
#
#  id          :integer          not null, primary key
#  person_id   :integer
#  name        :string(255)
#  address1    :string(255)
#  address2    :string(255)
#  address3    :string(255)
#  city        :string(255)
#  state       :string(255)
#  postal_code :string(255)
#  country     :string(255)
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
