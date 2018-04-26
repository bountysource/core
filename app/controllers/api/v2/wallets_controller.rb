class Api::V2::WalletsController < Api::BaseController

  def create
    @wallet = Wallet.new(wallet_params)
    @wallet.primary = true

    if @wallet.save
      render 'api/v2/wallets/show'
    else
      render json: { error: "Unable to add wallet: #{@wallet.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    end
  end

  private

  def wallet_params
    params.permit(:person_id, :label, :eth_addr)
  end

end