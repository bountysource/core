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

class Currency < ApplicationRecord
  validates :type, presence: true

  def self.sync_all
    [
      Currency::Bitcoin,
      Currency::Erc20
    ].each(&:sync)
  end

  def self.index
    currencies = {}
    all.order(featured: :asc).each do |currency|
      currencies[currency.symbol] = currency.value
    end
    currencies
  end

  def self.btc_rate
    Currency::Bitcoin.first.value
  end

  def featured!
    update(featured: true)
  end
end
