# == Schema Information
#
# Table name: currencies
#
#  id            :integer          not null, primary key
#  type          :string(255)      not null
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

class Currency::Bitcoin < Currency
  validates :value, numericality: { presence: true, greather_than_or_equal_to: 0 }

  def self.sync
    response = HTTParty.get('https://api.coinmarketcap.com/v1/ticker/bitcoin/')
    first_or_create.update(value: JSON.parse(response.body)[0]["price_usd"]) if response.success?
  end

  # update bitcoin name to currencies table and remove this
  def self.display_name
    'bitcoin'
  end
end
