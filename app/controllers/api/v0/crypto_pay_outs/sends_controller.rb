class Api::V0::CryptoPayOuts::SendsController < Api::V0::BaseController


  def create
    @crypto_pay_out = CryptoPayOut.find params[:crypto_pay_out_id]    
    @issue = @crypto_pay_out.issue
    @crypto_pay_out.reload

    render 'api/v0/crypto_pay_outs/show'
  end
end