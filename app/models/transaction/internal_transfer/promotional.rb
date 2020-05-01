# == Schema Information
#
# Table name: transactions
#
#  id                 :integer          not null, primary key
#  description        :text
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  audited            :boolean
#  type               :string(255)      default("Transaction"), not null
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

class Transaction::InternalTransfer::Promotional < Transaction::InternalTransfer

  def self.gift_to_with_amount(target, amount)
    target = (target.account || target.create_account) unless target.is_a?(Account)
    amount = BigDecimal(Money.new(amount * 100).to_s)
    transaction = nil

    ApplicationRecord.transaction do
      transaction = Transaction::InternalTransfer::Promotional.create!(
        audited: true,
        description: "Promotional gift of $#{amount}"
      )

      transaction.splits.create!(
        amount: -1 * amount,
        account: Account::Liability.instance
      )

      transaction.splits.create!(
        amount: amount,
        account: target
      )
    end

    transaction
  end

end
