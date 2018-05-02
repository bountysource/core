class Api::V2::WalletsController < Api::BaseController

  def create
    @wallet = Wallet.new(person_id: params[:person_id], label: params[:label], eth_addr: params[:eth_addr])
    @wallet.primary = true
    if @wallet.save && CryptoApi.verify_wallet(@wallet, params[:signed_txn])
    
      render 'api/v2/wallets/show'
    else
      render json: { error: "Unable to add wallet: #{@wallet.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    end
  end

end