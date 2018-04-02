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

class Currency::Bitcoin < Currency

  def self.sync
    response = HTTParty.get('https://coinbase.com/api/v1/prices/buy')

    if response.success?
      model = first || new
      model.value = response.parsed_response['amount']
      model.save
    end
  end

  def self.display_name
    'bitcoin'
  end

end
