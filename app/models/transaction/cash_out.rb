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

class Transaction::CashOut < Transaction
  def self.sales
    joins(:splits => [:account]).where('splits.account_id = ?', escrow_account.id).group('transactions.id, splits.transaction_id').select('-MAX(splits.amount) as sales').sum do |result|
      BigDecimal.new(result.sales)
    end
  end

  def self.processing_fees
    processing_fees_account = Account::BountySourceFeesPayment.instance
    joins(:splits => [:account]).where('splits.account_id = ?', processing_fees_account.id).group('transactions.id, splits.transaction_id').select('-MIN(splits.amount) as processing_fees').sum do |result|
      BigDecimal.new(result.processing_fees)
    end
  end

  def self.liability
    BigDecimal.new( joins(:splits => [:account]).where('accounts.type = ? OR accounts.type LIKE ?', 'Account::Personal', 'Account::Team%').sum('splits.amount') )
  end
end
