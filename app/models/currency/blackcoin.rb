# == Schema Information
#
# Table name: currencies
#
#  id         :integer          not null, primary key
#  type       :string(255)      not null
#  value      :decimal(, )      not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_currencies_on_type   (type)
#  index_currencies_on_value  (value)
#

class Currency::Blackcoin < Currency

  def self.sync
    response = HTTParty.get('http://coinmarketcap.com/currencies/blackcoin/')

    if response.success?
      value = response.match(/class="text-large">\$ ([0-9.]+)<\/span>/)[1].to_f

      model = first || new
      model.value = value
      model.save
    end
  end

  def self.display_name
    'blackcoin'
  end

end
