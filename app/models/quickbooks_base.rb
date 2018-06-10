class QuickbooksBase < ApplicationRecord

  self.abstract_class = true

  class ApiError < StandardError; end
  class AuthenticationError < StandardError; end

  def self.api_call(options)
    method = options[:method] || :get

    url = "#{ENV['QUICKBOOKS_BASE_URL']}/v3/company/#{ENV['QUICKBOOKS_USER_COMPANY_ID']}/#{options[:path]}#{options[:path]['?'] ? '&' : '?'}minorversion=8"
    post_body = options[:post_body].to_json if options[:post_body]


    token = QuickbooksToken.first

    parsed_json = nil

    token.perform_request do |access_token|
      response = HTTParty.send(
        method,
        url,
        {
          headers: { 
            'Accept' => 'application/json', 
            'Content-Type' => 'application/json', 
            'Authorization' => "Bearer #{access_token}" 
          },
          body: post_body
        }.reject { |k, v| v.nil? }
      )
      parsed_json = JSON.parse(response.body)

      if response.code === 401
        raise AuthenticationError.new(parsed_json)
      end

      if parsed_json['Fault']
        logger.error "QuickBooks API Fault: #{parsed_json['Fault'].inspect}"
        raise ApiError.new(parsed_json['Fault']['Error'].first['Message'])
      end
    end

    parsed_json
  end
end