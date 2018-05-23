class Api::V2::WalletsController < Api::BaseController

  def create
    @wallet = Wallet.find_or_initialize_by(person_id: params[:person_id], label: params[:label], eth_addr: params[:eth_addr])
    @wallet.primary = true
    @current_user = current_user
    @collection = @current_user.wallets
    if @wallet.save
      render 'api/v2/wallets/index'
    else
      render json: { error: "Unable to add wallet: #{@wallet.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    end
  end

  def update
    byebug
    @wallet = Wallet.find(params[:id])
    @wallet.eth_addr = params[:eth_addr]
    @collection = current_user.wallets
    if @wallet.save
      render 'api/v2/wallets/index'
    else
      render json: { error: "Unable to add wallet: #{@wallet.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    end

  end

  def metamask
    @wallet = Wallet.find_or_initialize_by(person_id: params[:person_id], label: params[:label], eth_addr: params[:eth_addr])
    @wallet.primary = true
    if @wallet.save && CryptoApi.verify_wallet(@wallet, params[:signed_txn])
      render 'api/v2/wallets/index'
    else
      render json: { error: "Unable to add wallet: #{@wallet.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    end
  end

  def destroy
    @wallet = current_user.wallets.find_by(params[:eth_addr])
    @collection = current_user.wallets
    if @wallet.destroy
      render 'api/v2/wallets/index'
    else
      render json: { error: @wallet.errors.full_messages }
    end
  end
end