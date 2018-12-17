class Transaction::InternalTransfer::InactivityFee < Transaction::InternalTransfer
  FEE_PERCENTAGE = 10
  FIXED_FEE = 10

  def self.charge_person(person)
    from_account = person.account

    balance = from_account.balance
    return if balance <= 0
    if balance <= 10
      fee = balance
    else
      fee = ((balance - 10) * (FEE_PERCENTAGE / 100.0)) + 10
      fee = fee.round(2, BigDecimal::ROUND_DOWN)
    end

    txn = nil

    ApplicationRecord.transaction do
      txn = create!(
        audited: true,
        description: "InactivityFee for Person#{person.id} #{Date::MONTHNAMES[Time.zone.now.month]}"
      )

      txn.splits.create!(
        amount: -1 * fee,
        account: from_account,
        item: person
      )

      txn.splits.create!(
        amount: fee,
        account: Account::InactivityFee.instance
      )
    end

    txn
  end
end
