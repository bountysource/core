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

class Address < ApplicationRecord

  belongs_to :person
  has_many :cash_outs

  validates :name, presence: true
  validates :address1, presence: true
  validates :city, presence: true
  validates :postal_code, presence: true
  validates :country, presence: true

end
