class Api::V0::EthereumTransactionRefundsController < Api::V0::BaseController
  def create
    owner = find_owner_from_crypto_bounties_if_exist

    @issue = Issue.find params[:issue_id]
    CryptoPayOut.create(
      issue_id: @issue.id, 
      transaction_hash: params[:transaction_hash], 
      type: 'ETH::Payout', 
      reason: params[:reason],
      person: owner,
      is_refund: true)
    CryptoApi.refund_transaction(@issue.id, params[:transaction_hash])

    @issue_address = @issue.issue_address
    @crypto_bounties = @issue_address.issue.crypto_bounties
    @crypto_pay_outs = @issue_address.issue.crypto_pay_outs

    render "api/v0/issue_addresses/show"
  end


  private
    def find_owner_from_crypto_bounties_if_exist
      crypto_bounty = CryptoBounty.find_by(transaction_hash: params[:transaction_hash])
      owner = crypto_bounty&.owner
    end
end