module EmailVerification
  attr_accessor :temp_confirmation_token

  def create_confirmation_token
    self.temp_confirmation_token = SecureRandom.urlsafe_base64
    update_attribute(:confirmation_token,  digest(temp_confirmation_token))
    update_attribute(:confirmation_sent_at, Time.zone.now)
  end

  def confirmation_token_expired?
    confirmation_sent_at < 2.hours.ago
  end

  def email_confirmation?(token)
    return false if confirmation_token.nil?
    BCrypt::Password.new(confirmation_token).is_password?(token)
  end

  private
  def digest(string)
    cost = ActiveModel::SecurePassword.min_cost ? BCrypt::Engine::MIN_COST :
                                                  BCrypt::Engine.cost
    BCrypt::Password.create(string, cost: cost)
  end
end