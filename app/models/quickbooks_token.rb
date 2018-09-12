# == Schema Information
#
# Table name: quickbooks_tokens
#
#  id            :bigint(8)        not null, primary key
#  access_token  :string
#  refresh_token :string
#  expires_at    :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class QuickbooksToken < ApplicationRecord
  def self.reinitiate_oauth_flow
    # Not implemented due to lower priority
    # Will need to obtain new access token either throught postman OR implement proper flow in admin
  end

  MAX_RETRIES = 3
  def refresh!
    url = "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer"
    params = {
      "grant_type" => 'refresh_token',
      "refresh_token" => refresh_token
    }

    headers = {
      "Accept" => 'application/json',
      "Content-Type" => "application/x-www-form-urlencoded"
    }

    auth = {username: ENV['QUICKBOOKS_APP_CONSUMER_KEY'], password: ENV['QUICKBOOKS_APP_CONSUMER_SECRET']}

    response = HTTParty.post(url, {
      basic_auth: auth,
      body: params.to_query, 
      headers: headers})

    parsed_json = JSON.parse(response.body)
    update!(
      access_token: parsed_json['access_token'],
      refresh_token: parsed_json['refresh_token']
    )
  end

  def perform_request(&block)
    begin
      yield(access_token)
    rescue QuickbooksBase::AuthenticationError => error
      # to prevent an infinite loop here keep a counter and bail out after N times...
      @retries ||= 0
      
      if @retries < MAX_RETRIES
        @retries += 1
        refresh!
        logger.error "Refreshing Token and retrying api call"
        retry
      else
        raise error
      end
    end
  end
end
