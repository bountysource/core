class Api::V2::Wallets::SetAsPrimariesController < Api::BaseController

  def create
    @wallet = Wallet.find(params[:wallet_id])
    @user = @wallet.person
    @user.wallets.update_all(primary: false)
    @wallet.primary = true
    @wallet.save

    @collection = @user.wallets.reload
    render 'api/v2/wallets/index'
  end
end