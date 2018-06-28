class Api::V0::CryptoPayOuts::SendsController < Api::V0::BaseController


  def create
    @crypto_pay_out = CryptoPayOut.find params[:crypto_pay_out_id]    
    @person = @crypto_pay_out.person
    @issue = @crypto_pay_out.issue

    CryptoApi.send_crypto_pay_out(@issue.id)
    
    @person.send_email(:crypto_pay_out_approved)
    @crypto_pay_out.reload

    render 'api/v0/crypto_pay_outs/show'
  end
end