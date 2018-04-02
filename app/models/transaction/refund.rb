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

class Transaction::Refund < Transaction
  def self.sales
    processing_fees_account = Account::BountySourceFeesPayment.instance
    BigDecimal.new(joins(:splits => [:account]).where('splits.account_id IN (?)', [escrow_account.id, processing_fees_account.id]).sum('splits.amount')) * -1
  end

  def self.processing_fees
    processing_fees_account = Account::BountySourceFeesPayment.instance
    BigDecimal.new(joins(:splits => [:account]).where('splits.account_id = ?', processing_fees_account.id).sum('splits.amount'))
  end

  def self.liability
    BigDecimal.new( joins(:splits => [:account]).where('accounts.type = ? OR accounts.type LIKE ?', 'Account::Personal', 'Account::Team%').sum('splits.amount') )
  end
end
