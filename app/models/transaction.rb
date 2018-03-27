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

# A Transaction represents a payment transfer (Split) from one account to one
# or more other accounts. Each Transaction's Split amounts total zero, making
# this a double entry bookkeeping system.

# See the Account and Split docs for more detail.

class Transaction < ActiveRecord::Base
  has_many :splits
  belongs_to :person
  has_one :shopping_cart, foreign_key: 'order_id'
  belongs_to :checkout_method, class_name: "Account"

  class Error < StandardError ; end
  class NotImplemented < Error ; end
  class InvalidCheckoutMethod < Error ; end

  class CustomValidations < ActiveModel::Validator
    def validate(record)
      # only validate when splits are present.
      # not the best solution, since transactions can now be created with no splits.
      # Why was this done? If you include an array of splits in a Transaction create statement,
      # the Splits will not be updated with the Transaction ID, since it doesn't exist yet.
      unless record.splits.empty?
        if record.splits.length < 2
          record.errors.add :base, "Must have at least two splits"
        end

        # require sum of splits amount to be zero
        unless record.balanced?
          record.errors.add :splits, "must be balanced"
        end
      end
    end
  end
  validates_with CustomValidations

  # cannot destroy a valid transaction with splits. no. never.
  before_destroy do
    unless splits.empty?
      errors.add :splits, "must be empty"
    end

    errors.empty?
  end

  # create a Transaction model from any number of Splits
  def self.build(&block)
    Transaction.transaction do
      transaction = Transaction.create!

      yield transaction

      # Rollback everything if transaction invalid.
      # Note: the only exception that triggers rollback is ActiveRecord::Rollback.
      # if the record is invalid, save! raises raise ActiveRecord::RecordInvalid.
      raise ActiveRecord::Rollback unless transaction.save

      transaction
    end
  end

  def balanced?
    splits.sum(:amount).zero?
  end

  # revert the splits, in a new transaction, effectively 'undoing' the transaction
  def revert!
    new_split_rows = splits.map { |split| { amount: -split.amount, account: split.account, item: split.item } }

    Transaction.build do |tr|
      tr.description = "Reversing Tranasction(#{id})"
      tr.splits.create(new_split_rows)
    end
  end

  # Get a list of items from this transaction. Pledges, Bounties, etc.
  def items
    @items ||= splits.item_not_null.purchaseable.map(&:item).uniq.compact
  end

  def shopping_cart_id
    shopping_cart.try(:id) || "0#{id}"
  end

  # Generate frontend receipt page URL
  def www_receipt_url
    uri = URI.parse(Api::Application.config.www_receipt_url % shopping_cart_id)
    uri.query = { receipt: 1 }.to_param
    uri.to_s
  end

  def sales_transactions(start=nil, finish=nil)
    d = DateTime.parse("01-04-2013")
    start_date, finish_date = [d.beginning_of_month, d.end_of_month]
    date_limit = ["created_at >= :start AND created_at <= :finish", start: start_date, finish: finish_date]

    # all Transactions for the month
    transactions = Transaction.send(:where, *date_limit)

    # Collect all PayPal sales and fee transactions.
    paypal_sale_transactions = transactions.where(%(transactions.description LIKE 'Paypal Transaction%'))
    paypal_fee_transactions = transactions.where(%(transactions.description LIKE 'Paypal Fee%'))

    paypal_sale_regex = %r{\APaypal Transaction \((.*?)\)\: (?:.*?)\Z}
    paypal_fee_regex = %r{\APaypal Fee \((.*?)\)\: (?:.*?)\Z}

    # Group together Sales and Fee adjustments by PayPal txn_id.
    # Creates array of arrays:
    # [
    #   [<Sale Transaction>, <Fee Transaction>]
    # ]
    paypal_sales = paypal_sale_transactions.in_groups_of(1)
    paypal_sale_transactions.to_a.each_with_index do |sale_transaction, i|
      # Get paypal txn_id from Sale Transaction
      sale_txn_id = sale_transaction.description.match(paypal_sale_regex)[1]

      # Locate the matching Fee Transaction by txn_id
      fee_transaction = paypal_fee_transactions.find do |fee_transaction|
        fee_txn_id = fee_transaction.description.match(paypal_fee_regex)[1]
        sale_txn_id == fee_txn_id
      end

      unless fee_transaction
        raise "Failed to find PayPal Fee Transaction for PayPal Sale with txn_id #{sale_txn_id}"
      end

      paypal_sales[i] << fee_transaction
    end
    paypal_sale_transactions
  end

  def self.escrow_account
    raise NotImplemented
  end

  # Calculate liability for item
  # TODO solidify how we want to handle merch fee... right now just reduce liability,
  # need to figure out if the money "goes anywhere" (another account type?)
  def self.liability_for_item(item)
    case item

    when Bounty
      BigDecimal.new(Money.new(item.amount * 100).to_s)

    when Pledge
      merch_fee = item.reward.try(:merchandise_fee) || 0
      BigDecimal.new(Money.new((item.amount - merch_fee) * 100).to_s)

    when TeamPayin
      BigDecimal.new(Money.new(item.amount * 100).to_s)

    when Proposal
      BigDecimal.new(Money.new(item.amount * 100).to_s)

    else
      raise "Unknown item type: #{item.inspect}"
    end
  end

  # Calculate gross amount for item
  # TODO solidify how we want to handle merch fee... right now just reduce liability, need to figure out if the money "goes anywhere" (another account type?)
  # TODO bounty upsells
  def self.gross_for_item(item)
    case item

    when Bounty
      BigDecimal.new(Money.new(item.amount * 100).to_s)

    when Pledge
      BigDecimal.new(Money.new(item.amount * 100).to_s)

    when TeamPayin
      BigDecimal.new(Money.new(item.amount * 100).to_s)

    when Proposal
      BigDecimal.new(Money.new(item.amount * 100).to_s)
    else
      raise "Unknown item type: #{item.inspect}"
    end
  end
end
