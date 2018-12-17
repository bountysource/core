class Account::InactivityFee < Account
  # not the best name... this account is Bountysource money (not somebody else's)
  def self.liability?
    false
  end
end
