# == Schema Information
#
# Table name: splits
#
#  id             :integer          not null, primary key
#  amount         :decimal(10, 2)   not null
#  status         :string           default("approved"), not null
#  account_id     :integer          not null
#  transaction_id :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  currency       :string           default("USD"), not null
#  item_id        :integer
#  item_type      :string
#  dirty          :integer          default(0), not null
#
# Indexes
#
#  index_splits_on_account_id      (account_id)
#  index_splits_on_transaction_id  (transaction_id)
#

# Splits are grouped into Transactions, where the sum of Splits in a
# Transaction equal zero. Thus Transactions embody the notion of "double
# entry" accounting.

# If there are only two splits, then the value of one must be positive, the
# other negative: this denotes that one account is debited, and another is
# credited by an equal amount.

# Every Split must point to its parent Transaction; a Split can belong to at
# most one Transaction.

class Split < ApplicationRecord
  belongs_to  :account
  belongs_to  :txn, class_name: 'Transaction', foreign_key: :transaction_id
  belongs_to  :item,   polymorphic: true

  validates :account,     presence: true
  validates :txn, presence: true
  validates :amount,      presence: true, numericality: true
  validates :dirty,       presence: true, numericality: { greater_than_or_equal_to: 0 }

  validate do
    errors.add :amount, 'cannot be zero' if amount == 0
  end

  default_scope lambda { order('splits.created_at DESC, splits.amount DESC') }
  scope :item_not_null, lambda { where('item_id IS NOT NULL') }
  scope :purchaseable, lambda { where(item_type: ['Bounty', 'Pledge', 'TeamPayin', 'Proposal', 'SupportLevelPayment', 'IssueSuggestionReward']) }

  class CustomValidator < ActiveModel::Validator
    def validate(record)
      # NOTE: this should never ever happen... and this load *EVERY* split into memory, very bad query.
      #if record.transaction
      #  # make sure this split isn't already in another transaction.
      #  other_transactions = Transaction.where('transactions.id != :txn_id', txn_id: record.transaction.id)
      #  split_ids = other_transactions.joins(:splits).pluck('splits.id')
      #
      #  if split_ids.include? record.id
      #    record.errors.add :base, 'Split must be unique to a single Transaction'
      #  end
      #end

      # needs either an account or an item with account relation
      unless record.account || (record.item && record.item.respond_to?(:account))
        record.errors.add :account, "needs to be passed in directly, or through item association"
      end
    end
  end
  validates_with CustomValidator

  # before creating the split, if no account has been provided, move the item account
  # if it should, and no account exists yet, create it!
  before_validation do
    # add account from item to split, if not manually provided. create item account if necessary
    if !account && item && item.respond_to?(:account)
      # find or create item account
      item_account = item.reload.account || item.create_account

      if item_account.valid?
        self.account = item_account
      else
        errors.add :account, item_account.errors.full_messages
      end
    end
  end

  # Money objects don't work with validates-numericality, so convert to BigDecimal
  def amount=(amount)
    if amount.is_a?(Money)
      self[:amount] = amount.to_d
    else
      self[:amount] = amount
    end
  end

  # Check if a bunch of splits' amounts sum to zero
  # (double-entry bookkeeping constraint)
  def self.balanced?(splits)
    splits.sum(&:amount) == 0
  end

end
