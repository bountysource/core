class CoinbaseApi

  API_URL = "https://coinbase.com/api/v1/%s"

  class Error < StandardError ; end

  def self.create_button name, price, options={}
    options[:name] ||= name

    unless price.is_a?(Money)
      price = price.to_money
    end

    options[:price_string] = price.to_f.to_s
    options[:price_currency_iso] = options[:price_currency_iso] || price.currency.iso_code

    response = call('/buttons', :post, body: { button: options })
    response.parsed_response['button'].with_indifferent_access if response.success?
  end

private

  def self.call *args
    path    = args[0].is_a?(String) ? args.shift.gsub(%r{^/},'') : ''
    method  = args[0].is_a?(Symbol) ? args.shift : :get
    options = args[0].is_a?(Hash) ? args.shift : {}
    url     = API_URL % path

    # Turn body into JSON object, otherwise it breaks
    options[:body] = options[:body].to_json if options[:body].is_a?(Hash)

    options[:headers] ||= {}
    options[:headers]['Content-Type'] = 'application/json'

    # HMAC authentication headers
    nonce = (Time.now.to_f * 1e6).to_i
    message = "#{nonce}#{url}#{options[:body]}"
    signature = OpenSSL::HMAC.hexdigest(OpenSSL::Digest.new('sha256'), Api::Application.config.coinbase[:api_secret], message)

    options[:headers]['ACCESS_KEY'] = Api::Application.config.coinbase[:api_key]
    options[:headers]['ACCESS_SIGNATURE'] = signature
    options[:headers]['ACCESS_NONCE'] = nonce.to_s

    HTTParty.send(method, url, options)
  end

end
