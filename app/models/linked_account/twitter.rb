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

class LinkedAccount::Twitter < LinkedAccount::Base

  validates :uid, presence: true

  # if we just added an oauth token, automatically follow @bountysource
  after_save do
    follow_bountysource if saved_change_to_oauth_token? && oauth_token_before_last_save == nil
  end

  after_create do
    delay.sync
  end

  # use the Oauth gem to handle this, because Oauth 1.1 is pure ass.
  def self.oauth_url(options={})
    request_token = oauth_consumer.get_request_token(
      oauth_callback: "#{Api::Application.config.api_url}auth/twitter/callback?state=#{options[:state]}"
    )
    request_token.authorize_url
  end

  def self.find_or_create_via_oauth_token_and_verifier(oauth_token, oauth_verifier)
    request_token = OAuth::RequestToken.new(oauth_consumer, oauth_token, '')
    access_token = request_token.get_access_token(oauth_verifier: oauth_verifier)

    user_info_response = access_token.get("/1.1/users/show.json?screen_name=#{access_token.params['screen_name']}")

    user_info = JSON.parse(user_info_response.body).with_indifferent_access

    # find or create Twitter account
    first_name, last_name = user_info['name'].split(/\s+/)
    linked_account = LinkedAccount::Twitter.find_or_create_by(uid: user_info['id']) do |user|
        user.first_name = first_name
        user.last_name = last_name
        user.login = user_info['screen_name']
        user.email = nil # Note: email addresses are not available through the Twitter API
        user.image_url = "twitter:#{user_info['screen_name']}"
      end

    logger.error "\n#{access_token.params}\n"

    # update with new oauth tokens and avatar url
    linked_account.update_attributes(
      oauth_token:  access_token.params[:oauth_token],
      oauth_secret: access_token.params[:oauth_token_secret],
      image_url:  "twitter:#{user_info['screen_name']}"
    )

    linked_account
  end

  # create friends after account link
  def after_link_with_person(person)
    PersonRelation::Twitter.find_or_create_friends person
  end

  def remote_info
    build_access_token do |api|
      JSON.parse(api.get("/1.1/users/show.json?screen_name=#{self.login}").body).with_indifferent_access
    end
  end

  def sync
    info = remote_info
    update_attributes(followers: info[:followers_count], following: info[:friends_count])
  end

  def friend_ids
    return [] if oauth_token.blank? || oauth_secret.blank?

    build_access_token do |api|
      response = api.get('/1.1/friends/ids.json')

      if (200...300).cover? response.code.to_i
        data = JSON.parse(response.body).with_indifferent_access
        data[:ids]
      else
        update_attributes(oauth_token: nil, oauth_secret: nil) and []
      end
    end
  end

  def follow_bountysource
    return if oauth_token.blank? || oauth_secret.blank?

    build_access_token do |api|
      logger.error api.post('/1.1/friendships/create.json', { screen_name: 'bountysource', follow: true }).inspect
    end

    self.class.build_bountysource_access_token do |api|
      logger.error api.post('/1.1/friendships/create.json', { screen_name: self.login, follow: true }).inspect
    end
  end

  def build_access_token(&block)
    yield OAuth::AccessToken.new(self.class.oauth_consumer, oauth_token, oauth_secret)
  end

  def self.build_bountysource_access_token(&block)
    yield OAuth::AccessToken.new(self.oauth_consumer, Api::Application.config.twitter_app[:bountysource_oauth_token], Api::Application.config.twitter_app[:bountysource_oauth_secret])
  end

protected

  def self.oauth_consumer
    OAuth::Consumer.new(
      Api::Application.config.twitter_app[:id],
      Api::Application.config.twitter_app[:secret],
      {
        site: 'https://api.twitter.com',
        scheme: :header,
        http_methods: :post,
        authorize_path: '/oauth/authenticate'
      }
    )
  end
end
