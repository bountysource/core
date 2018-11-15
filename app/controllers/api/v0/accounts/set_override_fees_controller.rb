class Api::V0::Accounts::SetOverrideFeesController < Api::V0::BaseController

  before_action :require_account

  def create
    if @account.update(account_params)
      head :created
    else
      render json: { error: @account.errors.full_messages.join(', ') }, status: :bad_request
    end
  end

  protected

  def require_account
    unless (@account = Account.find_by_id params[:account_id])
      render json: { error: 'Account not found' }, status: :not_found
    end
  end

  def account_params
    params.permit(:override_fee_percentage)
  end
end
