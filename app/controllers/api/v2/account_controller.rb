class Api::V2::AccountController < Api::BaseController

  include Api::V2::AccountHelper

  before_action :require_auth

  def show
    @item = current_user.account || current_user.create_account

    @balance = @item.balance.to_f

    if params.has_key? :cash_out
      @cash_out_amount = params[:cash_out].to_f

      @cash_out_fee             = @item.calculate_cash_out_fee(@cash_out_amount).to_f
      @cash_out_amount          = (@cash_out_amount - @cash_out_fee).to_f
    end
  end

end
