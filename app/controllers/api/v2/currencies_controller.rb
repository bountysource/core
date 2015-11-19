class Api::V2::CurrenciesController < ApplicationController

  def index
    render json: Currency.index, status: :ok
  end

end
