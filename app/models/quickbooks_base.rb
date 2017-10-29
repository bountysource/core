class QuickbooksBase < ActiveRecord::Base

  self.abstract_class = true

  class ApiError < StandardError; end

  # # NOTE: this is a Rails console method that gets an oauth token for a user
  def self.get_request_token
    # part 1
    url = "https://oauth.intuit.com/oauth/v1/get_request_token?oauth_callback=#{CGI.escape('http://localhost')}"
    signed_url = sign_request(
      method: :get,
      url: url,
      oauth_token_secret: nil
    )
    response = Rack::Utils.parse_nested_query(HTTParty.get(signed_url).response.body)
    puts "Click this: https://appcenter.intuit.com/Connect/Begin?oauth_token=#{response['oauth_token']}"
    puts "Allow the app, and after being redirected to localhost, copy the redirect URL"
    puts
    print "Redirected URL: "
    redir_url = URI.parse(gets.chomp)
    redir_params = Rack::Utils.parse_nested_query(redir_url.query)

    # part 2
    oauth_token_secret = response['oauth_token_secret']
    oauth_token = redir_params['oauth_token']
    oauth_verifier = redir_params['oauth_verifier']
    url = "https://oauth.intuit.com/oauth/v1/get_access_token?oauth_token=#{oauth_token}&oauth_verifier=#{oauth_verifier}"
    signed_url = sign_request(
      method: :get,
      url: url,
      oauth_token_secret: oauth_token_secret
    )
    response = Rack::Utils.parse_nested_query(HTTParty.get(signed_url).response.body)
  end

  def self.api_call(options)
    method = options[:method] || :get
    url = "https://quickbooks.api.intuit.com/v3/company/#{ENV['QUICKBOOKS_USER_COMPANY_ID']}/#{options[:path]}#{options[:path]['?'] ? '&' : '?'}minorversion=8&oauth_token=#{ENV['QUICKBOOKS_USER_OAUTH_TOKEN']}"
    post_body = options[:post_body].to_json if options[:post_body]
    signed_url = sign_request(
      method: method,
      url: url,
      oauth_token_secret: ENV['QUICKBOOKS_USER_OAUTH_TOKEN_SECRET'],
      post_body: post_body
    )
    response = HTTParty.send(
      method,
      signed_url,
      {
        headers: { 'Accept' => 'application/json', 'Content-Type' => 'application/json' },
        body: post_body
      }.reject { |k, v| v.nil? }
    )
    parsed_json = JSON.parse(response.body)

    if parsed_json['Fault']
      logger.error "QuickBooks API Fault: #{parsed_json['Fault'].inspect}"
      raise ApiError.new(parsed_json['Fault']['Error'].first['Message'])
    end

    parsed_json
  end

  def self.sign_request(options)
    oauth_consumer_key = ENV["QUICKBOOKS_APP_CONSUMER_KEY"]
    oauth_nonce = rand(10 ** 30).to_s.rjust(30,'0')
    oauth_signature_method = 'HMAC-SHA1'
    oauth_timestamp = Time.now.to_i.to_s
    oauth_version = '1.0'

    oauth_params = {
      oauth_consumer_key: oauth_consumer_key,
      oauth_nonce: oauth_nonce,
      oauth_signature_method: oauth_signature_method,
      oauth_timestamp: oauth_timestamp,
      oauth_version: oauth_version
    }
    oauth_params[:oauth_body_hash] = Base64.encode64(options[:post_body]).chomp if options[:post_body]

    base_url, params = options[:url].split('?')
    params = params ? Rack::Utils.parse_nested_query(params) : {}
    params.merge!(oauth_params)

    querystring = params.stringify_keys.sort.map { |k,v| "#{ERB::Util.url_encode(k.to_s)}=#{ERB::Util.url_encode(v.to_s)}" }.join("&")
    base_string = options[:method].to_s.upcase + '&' + ERB::Util.url_encode(base_url) + '&' + ERB::Util.url_encode(querystring)
    secret_key = ENV['QUICKBOOKS_APP_CONSUMER_SECRET'] + "&#{options[:oauth_token_secret]}"
    oauth_params[:oauth_signature] = Base64.encode64("#{OpenSSL::HMAC.digest('sha1', secret_key, base_string)}").chomp

    options[:url] + (options[:url]['?'] ? '&' : '?') + oauth_params.to_param
  end
end
