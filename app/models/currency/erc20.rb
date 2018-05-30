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

class Currency::Erc20 < Currency

  scope :featured, lambda { where(featured: true) }

  def self.sync
    featured.each do |token|
      token.sync
    end
    sync_canya
    sync_top10
  end

  def self.sync_canya
    url = 'https://api.coinmarketcap.com/v2/ticker/2343/'
    response = JSON.parse(HTTParty.get(url).body)
    token = response["data"]
    contract_address = "0x22a7d3c296692ba0f91c631b41bdfbc702885619"

    if tok = self.find_by(address: contract_address)
      value = token.dig("quotes", "USD", "price")
      tok.update(value: value) if value
    else
      create(
        address: contract_address,
        name: token.dig("name"),
        symbol: token.dig("symbol"),
        value: token.dig("quotes", "USD", "price")
      )
    end
  end

  def self.sync_top10
    url = "https://api.ethplorer.io/getTop?apiKey=freekey&criteria=cap&limit=10"
    top10 = []
    response = JSON.parse(HTTParty.get(url).body)
    response["tokens"].each do |token|
      if tok = self.find_by(address: token["address"])
        value = token["price"] && token["price"]["rate"]
        tok.update(value: value) if value
        top10 << tok
      elsif token["address"] == "0x0000000000000000000000000000000000000000"
        Currency::Ethereum.first_or_create.update(value: token["price"]["rate"])
      else
        top10 << create(
          address: token["address"],
          name: token["name"],
          symbol: token["symbol"],
          value: token["price"] && token["price"]["rate"]
        )
      end
    end
    return top10
  end

  def sync
    url = "https://api.ethplorer.io/getTokenInfo/#{address}?apiKey=freekey"
    response = JSON.parse(HTTParty.get(url).body)
    value = response["price"] && response["price"]["rate"]
    update(value: value) if value
  end
end
