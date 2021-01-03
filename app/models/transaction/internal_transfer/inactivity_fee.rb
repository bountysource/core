# == Schema Information
#
# Table name: transactions
#
#  id                 :integer          not null, primary key
#  description        :text
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  audited            :boolean
#  type               :string           default("Transaction"), not null
#  person_id          :integer
#  checkout_method_id :integer
#  gross              :decimal(, )
#  items              :decimal(, )
#  fee                :decimal(, )      default(0.0)
#  processing_fee     :decimal(, )      default(0.0)
#  merch_fee          :decimal(, )      default(0.0)
#  liability          :decimal(, )      default(0.0)
#
# Indexes
#
#  index_transactions_on_checkout_method_id  (checkout_method_id)
#  index_transactions_on_fees                (fee)
#  index_transactions_on_gross               (gross)
#  index_transactions_on_items               (items)
#  index_transactions_on_liability           (liability)
#  index_transactions_on_merch_fee           (merch_fee)
#  index_transactions_on_person_id           (person_id)
#  index_transactions_on_processing_fee      (processing_fee)
#

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
