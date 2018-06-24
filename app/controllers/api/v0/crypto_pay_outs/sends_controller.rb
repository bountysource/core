class Api::V0::CryptoPayOuts::SendsController < Api::V0::BaseController


  def create
    @crypto_pay_out = CryptoPayOut.find params[:crypto_pay_out_id]    
    @issue = @crypto_pay_out.issue

    
  end
end