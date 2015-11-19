module CurrencyConversion
  extend ActiveSupport::Concern

  class CurrencyConversionError < StandardError ; end

  included do
    rescue_from CurrencyConversionError do
      render json: { error: "Failed to convert amount" }, status: :bad_request
    end
  end

  def currency_convert(*args)
    Currency.convert(*args)
  rescue => e
    ::NewRelic::Agent.notice_error(e)
    raise CurrencyConversionError
  end
end
