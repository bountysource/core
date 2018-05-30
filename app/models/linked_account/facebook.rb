# == Schema Information
#
# Table name: linked_accounts
#
#  id               :integer          not null, primary key
#  person_id        :integer
#  type             :string(255)
#  uid              :bigint(8)
#  login            :string(255)
#  first_name       :string(255)
#  last_name        :string(255)
#  email            :string(255)
#  oauth_token      :string(255)
#  oauth_secret     :string(255)
#  permissions      :string(255)
#  synced_at        :datetime
#  sync_in_progress :boolean          default(FALSE)
#  followers        :integer          default(0)
#  following        :integer          default(0)
#  created_at       :datetime
#  updated_at       :datetime
#  account_balance  :decimal(10, 2)   default(0.0)
#  anonymous        :boolean          default(FALSE), not null
#  company          :string(255)
#  location         :string(255)
#  bio              :text
#  cloudinary_id    :string(255)
#  deleted_at       :datetime
#
# Indexes
#
#  index_linked_accounts_on_anonymous     (anonymous)
#  index_linked_accounts_on_email         (email) WHERE (email IS NOT NULL)
#  index_linked_accounts_on_login         (login)
#  index_linked_accounts_on_person_id     (person_id)
#  index_linked_accounts_on_uid           (uid)
#  index_linked_accounts_on_uid_and_type  (uid,type) UNIQUE
#

class LinkedAccount::Facebook < LinkedAccount::Base

  validates :uid, presence: true

  OAUTH_CODE_URL        = "https://www.facebook.com/dialog/oauth"
  API_HOST              = "https://graph.facebook.com/"
  OAUTH_EXCHANGE_URL    = "#{API_HOST}oauth/access_token"
  USER_INFO_URL         = "#{API_HOST}me"

  # create URL for Facebook authentication via oauth
  #
  # http://www.facebook.com/dialog/oauth/?
  #  client_id=YOUR_APP_ID
  #  &redirect_uri=YOUR_REDIRECT_URL
  #  &state=YOUR_STATE_VALUE
  #  &scope=COMMA_SEPARATED_LIST_OF_PERMISSION_NAMES
  def self.oauth_url(options={})
    %(#{OAUTH_CODE_URL}?#{options.merge(
      client_id:      Api::Application.config.facebook_app[:id],
      redirect_uri:   "#{Api::Application.config.api_url}auth/facebook/callback",
      state:          options[:state],
      display:        options[:display] || 'page',
      scope:          options[:scope],
      response_type:  'code'
    ).to_param})
  end

  # https://graph.facebook.com/oauth/access_token?
  #   client_id=YOUR_APP_ID
  #   &redirect_uri=YOUR_URL
  #   &client_secret=YOUR_APP_SECRET
  #   &code=THE_CODE_FROM_ABOVE
  def self.find_or_create_via_oauth_code(code)
    params = {
      client_id:      Api::Application.config.facebook_app[:id],
      client_secret:  Api::Application.config.facebook_app[:secret],
      redirect_uri:   "#{Api::Application.config.api_url}auth/facebook/callback",
      code:           code
    }

    # exchange the code for an access token
    response = HTTParty.get("#{OAUTH_EXCHANGE_URL}?#{params.to_param}")

    # raise if access_token fetch fails

    unless (200...300).cover? response.code.to_i
      oauth_response = response.parsed_response
      raise OauthError, oauth_response[:error]
    end

    oauth_response = response.parsed_response
    
    # get user info
    params = {
      access_token: oauth_response["access_token"],
      fields: "id,name,first_name,last_name,picture"
    }

    user_info = with_https "#{USER_INFO_URL}?#{params.to_param}" do |uri, http|
      request = Net::HTTP::Get.new(uri.to_s)
      JSON.parse(http.request(request).body).with_indifferent_access
    end
    # find or create a facebook linked account
    facebook_account = find_or_create_by(
      uid: user_info['id']) do |user|
      user.first_name = user_info['first_name']
      user.last_name = user_info['last_name']
      user.email = user_info['email']
      user.image_url = "facebook:#{user_info['username'] || user_info['id']}"
    end

    # update the facebook user with most recent access token
    facebook_account.update_attributes oauth_token: oauth_response["access_token"]

    facebook_account
  end

  def after_link_with_person(person)
    PersonRelation::Facebook.find_or_create_friends person
  end

  # make call to the FB API to get the users's friends.
  # returns an array of objects containing the friend's name and (Facebook) ID
  def friends
    return [] if oauth_token.blank?

    self.class.with_https "#{API_HOST}me/friends?#{{ access_token: oauth_token }.to_param}" do |uri, http|
      request = Net::HTTP::Get.new(uri.to_s)
      response = http.request(request)

      if (200...300).cover? response.code.to_i
        JSON.parse(response.body)['data']
      else
        update_attributes(oauth_token: nil) and []
      end
    end
  end
end
