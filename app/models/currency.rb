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

class Currency < ActiveRecord::Base

  attr_accessible :type, :value

  validates :type, presence: true
  validates :value, numericality: { presence: true, greather_than_or_equal_to: 0 }

  def self.sync_all
    [Bitcoin,
     Blackcoin,
     Mastercoin,
     Ripple
    ].each(&:sync)
  end

  def self.index
    currencies = {}
    pluck(:type).map(&:constantize).each do |klass|
      currencies[klass.display_name] = klass.first.value
    end
    currencies
  end

  def self.from_symbol(symbol)
    case symbol
    when 'BLK'
      Blackcoin
    when 'BTC'
      Bitcoin
    when 'MSC'
      Mastercoin
    when 'XRP'
      Ripple
    end
  end

  def self.rate_to_usd(symbol)
    case symbol
    when 'USD'
      1
    else
      currency = from_symbol(symbol)
      currency.first.value
    end
  end

  def self.convert(amount, from, to)
    amount ||= 0
    amount = amount.to_f if amount.is_a?(String)
    from ||= 'USD'
    rate = rate_to_usd(from) / rate_to_usd(to)
    amount * rate
  end

end
