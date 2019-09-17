class ChargeUserInactivityFee
  INACTIVITY_PERIOD = 90.days

  def initialize
    @inactives = PeopleQuery.new.inactive_since(INACTIVITY_PERIOD.ago)
  end

  def perform
    @inactives.each do |inactive_person|
      next if person_charged_this_month?(inactive_person)
      next if inactive_person.email == 'support@bountysource.com'
      txn = Transaction::InternalTransfer::InactivityFee.charge_person(inactive_person)
      inactive_person.send_email(:inactivity_fee_charged) if txn
    end
  end

  def self.charge!
    self.new.perform
  end

  private

  def person_charged_this_month?(person)
    Transaction::InternalTransfer::InactivityFee
      .joins(:splits)
      .where('transactions.created_at > ?', Time.zone.now.beginning_of_month)
      .where(splits: { item: person })
      .present?
  end
end