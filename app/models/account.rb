# == Schema Information
#
# Table name: accounts
#
#  id          :integer          not null, primary key
#  type        :string(255)      default("Account"), not null
#  description :string(255)      default(""), not null
#  currency    :string(255)      default("USD"), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  owner_id    :integer
#  owner_type  :string(255)
#  standalone  :boolean          default(FALSE)
#
# Indexes
#
#  index_accounts_on_item_id    (owner_id)
#  index_accounts_on_item_type  (owner_type)
#  index_accounts_on_type       (type)
#

# An account consists of a list of Splits which debit/credit the account.
# See the documentation in Transaction and Split for more detail

class Account < ActiveRecord::Base

  attr_accessible :currency, :description, :owner, :name

  # NOTE: the presence of an owner is optional
  belongs_to :owner, polymorphic: true, autosave: false
  has_many :splits
  has_many :transactions, through: :splits

  has_many :orders, foreign_key: :checkout_method_id, class_name: "Transaction::Order"

  scope :standalone, lambda { where(standalone: true) }
  scope :escrow, lambda { where(type: %w(Account::Paypal Account::GoogleWallet Account::BofA)) }
  scope :fee, lambda { where(type: %w(Account::BountySourceFeesBounty Account::BountySourceFeesPledge Account::BountySourceFeesTeam)) }

  class Error < StandardError ; end
  class NotImplemented < Error ; end

  before_validation do
    # ensure that only 1 account of type exists if there is no item
    # Example: there can multiple accounts of type Fundraiser, but only 1 Account::Fundraiser per fundraiser.
    unless self.class.where(type: self.class.name, owner_id: nil, owner_type: nil).empty?
      errors.add :base, "There can only be one #{self.class} if no item is specified"
    end

    # only 1 account per owner
    if new_record? and owner
      existing_accounts = Account.where(type: self.class.name, owner_id: owner_id, owner_type: owner_type)

      unless existing_accounts.empty?
        errors.add :base, "#{owner.class}(#{owner.id}) can only have 1 #{self.class.name}"
      end
    end

    errors.empty?
  end

  # You shouldn't be able to destroy accounts with activity...
  before_destroy do
    errors.add :base, 'Cannot delete account with Splits' unless splits.empty?
    errors.empty?
  end

  # all accounts are liability accounts unless explicitly overridden
  def self.liability?
    true
  end

  class NotEnoughFunds < StandardError; end

  def balance
    reload.splits.sum(:amount)
  end

  # TODO create column, use relation
  def fee_percentage
    0.10
  end

  # transfer money from one account to another
  def self.transfer!(options)
    raise ArgumentError, "Required: from, to, amount" unless ([:from, :to, :amount] - options.keys).empty?
    raise ArgumentError, "Amount must be of type Money" unless options[:amount].is_a?(Money)

    # check account balance, either through association, or balance if an account
    if options[:from].is_a? Account
      raise NotEnoughFunds, 'Not enough money in account' if options[:amount].amount > options[:from].balance
    elsif options[:from].respond_to? :account
      raise NotEnoughFunds, "Not enough money in #{options[:from].class} account" if options[:amount].amount > options[:from].account_balance
    else
      raise ArgumentError, 'invalid from object'
    end

    from_split  = { amount: -options[:amount] }
    to_split    = { amount: options[:amount] }

    # set as item if has_item, otherwise, assume it is_a? Account
    from_split[options[:from].respond_to?(:account) ? :item : :account] = options[:from]
    to_split[options[:to].respond_to?(:account) ? :item : :account] = options[:to]

    transaction = Transaction.build do |tr|
      tr.description = options[:description] || "Admin account transfer"
      tr.splits.create([from_split, to_split])
    end

    transaction
  end

  # shortcut for Account::Type.first.
  # returns nil if account type can have more than one row.
  # creates the instance if it does not yet exist.
  def self.instance
    res = where(type: self.name)
    if res.empty?
      create!
    elsif res.count == 1
      res.first
    else
      raise "There is more than one #{name}: #{res.pluck(:id).inspect}"
    end
  end

  # merge @account into this account, moving over splits, then destroy @account.
  # SERCHIIINNN, MERGE AND DESTROY!!!
  # TODO ActiveRecord::Base#merge! should take care of the merging?
  def merge_with_and_destroy!(account)
    account.splits.find_each { |s| s.update_attribute :account, self }
    account.destroy
    valid?
  end

  def display_name
    self.class.name
  end

  # Group Account types and the sum of their splits for the given date.
  def self.balance_report(date=DateTime.now)
    sql_date = ActiveRecord::Base.connection.quote(date)
    ActiveRecord::Base.connection.select_all("select accounts.type, sum(splits.amount) as balance from accounts left join splits on accounts.id = splits.account_id where splits.created_at < #{sql_date} group by accounts.type order by balance desc, type desc")
  end

  # Balance report for a single Account instance
  def self.balance_at(date)
    BigDecimal.new(joins(:splits => [:account]).where('splits.created_at < ?', date).sum('splits.amount * -1'))
  end

  def self.balance_per_type_at(timestamp, include_sweep)
    query = Split.
      select('accounts.type as type, sum(splits.amount) as balance').
      joins('left join accounts on accounts.id=splits.account_id').
      group('accounts.type').
      reorder('')

    if include_sweep
      query = query.
        where('splits.created_at < ? or (splits.created_at = ? and transactions.type = ?)', timestamp, timestamp, Transaction::InternalTransfer::RevenueRecognition.name).
        joins('left join transactions on transactions.id=splits.transaction_id')
    else
      query = query.where('splits.created_at < ?', timestamp)
    end

    query.map { |s| [s.type, s.balance.to_f] }
  end

  def self.account_type_balances_by_start_and_end(start_date, end_date)
    start_balances = Account.balance_per_type_at(start_date, true)
    end_balances = Account.balance_per_type_at(end_date, false)

    return [start_balances.map(&:first)+end_balances.map(&:first)].flatten.uniq.map { |account_type|
      {
        type: account_type,
        start_balance: start_balances.find { |row| row[0] == account_type }.try(:[],1) || 0.0,
        end_balance: end_balances.find { |row| row[0] == account_type }.try(:[],1) || 0.0,
        liability: account_type.constantize.liability?
      }
    }
  end

  # Liability at date. Simple the sum of account balances
  def self.liability_at(date)
    calculate = lambda { |klass| BigDecimal.new(klass.joins(:splits).where('splits.created_at < ?', date).sum(:amount)) }
    [
      calculate[Account::Fundraiser],
      calculate[Account::IssueAccount],
      calculate[Account::Team],
      calculate[Account::Personal],
      calculate[Account::Repository],
      calculate[Account::DoctorsWithoutBorders],
      calculate[Account::ElectronicFrontierFoundation],
      calculate[Account::FreeSoftwareFoundation],
      calculate[Account::SoftwarePublicInterest],
      calculate[Account::Apache]
    ].sum
  end

  # all reporting is now done in PST timezone instead of UTC.
  # besides, paypal does it, google wallet does it, what's the worst that could happen.....
  def self.reporting_time_zone
    'America/Los_Angeles'
  end

  # Helper method to sum all of the gross sales for report generation
  def self.transfers(date_range=nil)
    date_range ||= Transaction.order('created_at asc').first.created_at..Transaction.order('created_at desc').first.created_at
    # transaction_ids = Transaction::BankTransfer.where(created_at: date_range).joins(:splits => [:account]).where('accounts.type = ?', name).pluck(:id)
    Split.joins(:transaction, :account).where(created_at: date_range).where('transactions.type = ? AND splits.account_id = ?', 'Transaction::BankTransfer', instance.id).sum('splits.amount * -1')
  end

  # Calculate the cash out fee.
  #
  # Formula:
  # (account balance) * 0.10
  def calculate_cash_out_fee amount
    #(Money.new(amount.to_f*100) / 10).to_f
    0
  end

end
