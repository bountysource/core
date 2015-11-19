module NumberToDollarsHelper
  def number_to_dollars(num, options={})
    ActionController::Base.helpers.number_to_currency(num.floor, options.merge(precision: 0, unit: "$"))
  end
end
