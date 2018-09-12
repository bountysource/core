class Api::V2::AccountController < Api::BaseController

  include Api::V2::AccountHelper

  before_action :require_auth

  def show
    @item = current_user.account || current_user.create_account

    @balance = @item.balance.to_f

    if params.has_key? :cash_out
      if team_id = params[:source].try(:match, /\Ateam(\d+)\Z/).try(:[], 1)
        @item = current_user.team_member_relations.where(admin: true, team_id: team_id).first.try(:team).try(:account)
      end
      @cash_out_amount = params[:cash_out].to_f

      @cash_out_fee             = @item.calculate_cash_out_fee(@cash_out_amount).to_f
      @cash_out_amount          = (@cash_out_amount - @cash_out_fee).to_f
    end
  end

end
