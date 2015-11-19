# == Schema Information
#
# Table name: access_tokens
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  token      :string(255)      not null
#  remote_ip  :string(255)
#  user_agent :string(255)
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_access_tokens_on_person_id  (person_id)
#  index_access_tokens_on_token      (token) UNIQUE
#

class AccessToken < ActiveRecord::Base

  attr_accessible :remote_ip, :user_agent

  belongs_to :person

  before_create :token

  def token
    read_attribute(:token) || write_attribute(:token, generate_token)
  end

  # expires after 30 days
  def still_valid?
    person_id, time, hash = (token||'').split('.')
    return false if person_id.blank? || time.blank? || hash.blank?
    return false if Person.active.where(id: person_id).count == 0
    return false if time.to_i < 30.day.ago.to_i
    return false if hash != self.class.hash_access_token(person_id, time)
    return true
  end

protected

  def generate_token
    time = Time.now.to_i
    "#{person.id}.#{time}.#{self.class.hash_access_token(person.id, time)}"
  end

  def self.hash_access_token(person_id, time)
    Digest::SHA1.hexdigest("#{person_id}.#{time}.#{Api::Application.config.access_token_secret}")
  end

end
