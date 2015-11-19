# == Schema Information
#
# Table name: linked_accounts
#
#  id               :integer          not null, primary key
#  person_id        :integer
#  type             :string(255)
#  uid              :integer          not null
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
#  index_linked_accounts_on_email         (email)
#  index_linked_accounts_on_login         (login)
#  index_linked_accounts_on_person_id     (person_id)
#  index_linked_accounts_on_uid           (uid)
#  index_linked_accounts_on_uid_and_type  (uid,type) UNIQUE
#

class LinkedAccount::Gittip < LinkedAccount::Base

  validates :oauth_token, presence: true
  validates :person, presence: true
  validate  :access_token_valid?

  # sync account after create
  after_create { delay.remote_sync }

  def self.whitelisted_params(params)
    params.select { |k,_| %w(access_token redirect_url login external_access_token first_name last_name email display_name image_url).include? k.to_s }
  end

  def access_token_valid?
    unless self.class.access_token_valid? oauth_token
      errors.add :access_token, 'is not invalid'
    end
  end

  def self.access_token_valid?(access_token)
    # secret must match
    gittip_user_id, time, hash = (access_token||'').split('.')
    hash == hash_access_token(gittip_user_id, time)
  end

  # pulls remote user ID from access token. token validity is checked by model validation
  def self.create_via_access_token(attrs={})
    gittip_user_id, time, hash = (attrs[:oauth_token]||'').split('.')
    create attrs.merge(uid: gittip_user_id)
  end

  # find linked account model from access token. returns nil for invalid access tokens
  def self.find_via_access_token(access_token)
    if access_token_valid? access_token
      gittip_user_id, time, hash = (access_token||'').split('.')
      find_by_uid gittip_user_id
    end
  end

  def remote_sync
    logger.info "Gittip account sync temporarily disabled"

    #response = api "on/bountysource/account.json"
    #
    #if response.ok?
    #  self.account_balance  = response['balance'].to_f  if response['balance']
    #  self.login            = response['login']         if response['login']
    #  self.save
    #end
    #
    #response
  end

  def self.api(path, options={})
    # kill unneccessary slash if present
    path = path[1..-1] if path =~ /^\//

    uri = URI.parse "#{Api::Application.config.gittip_host}#{path}"

    # merge params from query string with params in options hash
    params = Rack::Utils.parse_nested_query uri.query
    params.merge! options[:params] if options[:params]
    uri.query = params.to_param

    Rails.logger.error "GITTIP API CALL: #{uri}\n * Params: #{params}"

    response = HTTParty.get(uri.to_s)

    json_response_body = JSON.parse(response.body) rescue nil
    Rails.logger.error "GITTIP RESPONSE: #{response.code}\n * Body: #{json_response_body}\n"

    response
  end

  def api(path, options={})
    options[:params] ||= {}
    options[:params].merge! access_token: oauth_token
    self.class.api(path, options)
  end

protected

  def self.hash_access_token(user_id, time)
    Digest::MD5.hexdigest "#{user_id}.#{time}.#{Api::Application.config.gittip_secret}"
  end

end
