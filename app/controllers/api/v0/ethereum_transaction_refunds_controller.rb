class Api::V0::EthereumTransactionRefundsController < Api::V0::BaseController
  def create
    CryptoApi.refund_transaction(params[:issue_id], params[:transaction_hash], params[:reason])

    head :ok
  end
end