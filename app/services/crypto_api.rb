class CryptoApi
  BASE_URL = ENV['CRYPTO_API_URL']
  DEFAULT_HEADERS = {'Content-Type' => 'application/json', 'api_key' => ENV['CRYPTO_API_SECRET']}

  class MissingIssueAddressError < StandardError; end
  class CryptoPayOutFailed < StandardError; end


  def self.generate_address(issue_id)
    url = "#{BASE_URL}issues/#{issue_id}/issue_address"
    response = RestClient.post(url, {id: issue_id, category: 1}.to_json, DEFAULT_HEADERS)
    raise MissingIssueAddressError unless response.code == 201
  end

  def self.refresh_bounties(issue_id)
    url = "#{BASE_URL}issues/#{issue_id}/bounties/refresh"
    response = RestClient.get(url, DEFAULT_HEADERS)
  end

  def self.verify_wallet(wallet, signed_txn)
    url = "#{BASE_URL}wallets/#{wallet.id}/verify"

    params = {
      signedTxn: signed_txn,
      personId: wallet.person_id,
      walletAddrs: wallet.eth_addr
    }
    response = RestClient.post(url, params.to_json, DEFAULT_HEADERS )

    if response.code == 201
      true
    else
      false
    end
  end

  def self.send_crypto_pay_out(issue_id)
    url = "#{BASE_URL}issues/#{issue_id}/bounties/payout"

    response = RestClient.get(url, DEFAULT_HEADERS)

    raise CryptoPayOutFailed unless response.code == 201
  end
end