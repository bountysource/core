# == Schema Information
#
# Table name: currencies
#
#  id         :integer          not null, primary key
#  type       :string           not null
#  value      :decimal(, )      not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_currencies_on_type   (type)
#  index_currencies_on_value  (value)
#

class Currency::Mastercoin < Currency

  def self.sync
    response = HTTParty.get('https://api.coinmarketcap.com/v1/ticker/mastercoin/')
    self.update_price(response)
  end

  def self.display_name
    'mastercoin'
  end

end
