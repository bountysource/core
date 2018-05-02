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

class Transaction::InternalTransfer::RevenueRecognition < Transaction::InternalTransfer

  # pass in Time.now.utc.beginning_of_month
  def self.create_transaction_as_of(timestamp)
    accounts_to_sweep = [
      Account::BountySourceFeesBounty.instance,
      Account::BountySourceFeesPayment.instance,
      Account::BountySourceFeesPledge.instance,
      Account::BountySourceFeesTeam.instance,
      Account::BountySourceMerch.instance
    ]

    # created_at is 1 second before timestamp, so in previous month
    transaction = new(description: "Revenue recognition as of #{timestamp}", audited: true)
    transaction.created_at = timestamp

    splits = []
    accounts_to_sweep.each do |account|
      balance = account.splits.joins('left join transactions on transactions.id=splits.transaction_id').where('splits.created_at < ? or (splits.created_at = ? and transactions.type = ?)', timestamp, timestamp, Transaction::InternalTransfer::RevenueRecognition.name).sum(:amount)
      next if balance == 0.0
      transaction.save if transaction.new_record?
      split = transaction.splits.create(account: account, amount: -1.0 * balance)
      split.update_attribute(:created_at, transaction.created_at)
    end

    if transaction.splits.length > 0
      adjustment = transaction.splits.sum(&:amount)
      if adjustment != 0.0
        split = transaction.splits.create(account: Account::BountySourceAdjustment.instance, amount: -1.0 * adjustment)
        split.update_attribute(:created_at, transaction.created_at)
      end
    end

    transaction.new_record? ? nil : transaction
  end

end
