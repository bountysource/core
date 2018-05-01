class CryptoApi
  BASE_URL = ENV['CRYPTO_API_URL']
  DEFAULT_HEADERS = {'Content-Type' => 'application/json', 'api_key' => ENV['CRYPTO_API_SECRET']}

  class MissingIssueAddressError < StandardError; end


  def self.generate_address(issue_id)
    url = "#{BASE_URL}issues/#{issue_id}/issue_address"
    response = RestClient.post(url, {id: issue_id, category: 1}.to_json, DEFAULT_HEADERS)
    raise MissingIssueAddressError unless response.code == 201
  end

  def self.get_balance(issue_id)
    url = "#{BASE_URL}issues/#{issue_id}/balance"
    response = RestClient.get(url, DEFAULT_HEADERS)
    # address = JSON.parse(response)["address"]
  end
end