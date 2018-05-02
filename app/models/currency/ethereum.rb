# == Schema Information
#
# Table name: currencies
#
#  id            :integer          not null, primary key
#  type          :string           not null
#  value         :decimal(, )
#  created_at    :datetime
#  updated_at    :datetime
#  name          :string
#  symbol        :string
#  address       :string
#  cloudinary_id :string
#  featured      :boolean
#
# Indexes
#
#  index_currencies_on_symbol  (symbol)
#  index_currencies_on_type    (type)
#  index_currencies_on_value   (value)
#

class Currency::Ethereum < Currency
  validates :value, numericality: { presence: true, greather_than_or_equal_to: 0 }
end
