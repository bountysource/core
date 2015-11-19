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

class LinkedAccount::Base < ActiveRecord::Base
  self.table_name = 'linked_accounts'

  attr_accessible :type, :person, :uid, :first_name, :last_name, :email, :login,
                  :oauth_token, :oauth_secret, :synced_at, :sync_in_progress,
                  :followers, :following, :company, :location, :bio, :permissions,
                  :linked_account

  has_many :team_member_relations, as: :owner
  belongs_to :person
  has_many :tracker_relations, foreign_key: :linked_account_id

  has_many :team_member_relations

  has_many :comments, foreign_key: :author_linked_account_id

  has_cloudinary_image

  validates :uid, presence: true

  class AlreadyLinked < StandardError; end
  class OauthError < StandardError; end

  # Note: Override in subclass
  # begin OAUTH, get the code
  def self.oauth_url(options={})
    raise "Need to implement #{self.name}::oauth_url"
  end

  # Note: Override in subclass
  # exchange the code for an access_token
  def self.find_or_create_via_oauth_code(code)
    raise "Need to implement #{self.name}::find_or_create_via_oauth_code"
  end

  def self.find_by_access_token(access_token)
    linked_account_id, time, hash = (access_token||'').split('.')
    return nil if linked_account_id.blank? || time.blank? || hash.blank?
    return nil unless time.to_i > Time.now.to_i
    return nil unless (linked_account = find_by_id(linked_account_id))
    return nil unless hash == hash_access_token(linked_account, time)
    linked_account
  end

  def create_access_token
    time = 1.day.from_now.to_i
    "#{self.id}.#{time}.#{self.class.hash_access_token(self, time)}"
  end

  def link_with_person(new_person)
    raise AlreadyLinked, "Account already linked" unless self.person.nil? && new_person
    update_attributes person: new_person
    new_person.update_attributes!(cloudinary_id: cloudinary_id) if has_image? && !new_person.has_image?
    after_link_with_person(person) # callback optionally defined in subclasses
  end

  def after_link_with_person(person)
    # override this
  end

  # to be overridden in subclasses
  def permissions
    (super || "").split(",")
  end

  def has_permission?(permission)
    permissions.include? permission.to_s
  end

  def name
    first_name.blank? ? login : "#{first_name} #{last_name}".strip
  end

  def self.encode_state(hash)
    Base64.encode64(hash.to_json).gsub(/\n/,'').gsub('+','-').gsub('=','_')
  end

  def self.decode_state(raw)
    json = Base64.decode64(raw.gsub('-','+').gsub('_','='))
    JSON.parse(json).with_indifferent_access
  end

protected

  def self.with_https(url, &block)
    uri               = URI.parse(url)
    http              = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl      = true
    http.verify_mode  = OpenSSL::SSL::VERIFY_NONE

    yield uri, http
  end

  def self.hash_access_token(linked_account, time)
    Digest::SHA1.hexdigest("#{linked_account.id}.#{time}.#{Api::Application.config.linked_account_secret}")
  end
end
