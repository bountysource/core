class Api::V0::EthereumTransactionRefundsController < Api::V0::BaseController
  def create
    owner = find_owner_from_crypto_bounties_if_exist
    CryptoPayOut.create(
      issue: issue, 
      transaction_hash: params[:transaction_hash], 
      type: 'ETH::Payout', 
      reason: params[:reason],
      person: owner,
      is_refund: true)
    CryptoApi.refund_transaction(params[:issue_id], params[:transaction_hash])

    head :ok
  end


  private
    def find_owner_from_crypto_bounties_if_exist
      crypto_bounty = CryptoBounty.find_by(transaction_hash: params[:transaction_hash])
      owner = crypto_bounty&.owner
    end
end