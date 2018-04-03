class Api::V1::TransactionsController < ApplicationController

  before_action :require_auth

  def index
    @transactions = @person.orders.order("created_at desc")
  end

  def show
    if params[:id].starts_with?('0')
      # expected order id
      @transaction = @person.orders.find_by_id(params[:id])
    else
      # legacy transaction id
      @transaction = @person.shopping_carts.find_by_id(params[:id]).try(:order)
    end

    unless @transaction
      render json: { error: "Transaction not found" }, status: :not_found
    end
  end


end
