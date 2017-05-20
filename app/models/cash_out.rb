# == Schema Information
#
# Table name: cash_outs
#
#  id                         :integer          not null, primary key
#  type                       :string(255)      not null
#  person_id                  :integer          not null
#  address_id                 :integer          not null
#  mailing_address_id         :integer
#  bitcoin_address            :string(255)
#  paypal_address             :string(255)
#  remote_ip                  :string(255)
#  user_agent                 :string(255)
#  amount                     :decimal(, )
#  sent_at                    :datetime
#  us_citizen                 :boolean
#  created_at                 :datetime
#  updated_at                 :datetime
#  serialized_address         :text
#  serialized_mailing_address :text
#  fee                        :decimal(, )
#  fee_adjustment             :decimal(, )
#  ripple_address             :string(255)
#  mastercoin_address         :string(255)
#  is_refund                  :boolean          default(FALSE), not null
#  account_id                 :integer          not null
#
# Indexes
#
#  index_cash_outs_on_address_id          (address_id)
#  index_cash_outs_on_amount              (amount)
#  index_cash_outs_on_bitcoin_address     (bitcoin_address)
#  index_cash_outs_on_mailing_address_id  (mailing_address_id)
#  index_cash_outs_on_paypal_address      (paypal_address)
#  index_cash_outs_on_person_id           (person_id)
#  index_cash_outs_on_sent_at             (sent_at)
#  index_cash_outs_on_type                (type)
#  index_cash_outs_on_us_citizen          (us_citizen)
#

class CashOut < ActiveRecord::Base

  class InvalidType < StandardError ; end

  attr_accessible :person, :address, :amount, :mailing_address, :bitcoin_address, :remote_ip, :user_agent, :paypal_address,
                  :us_citizen, :sent_at, :is_refund

  belongs_to :person
  belongs_to :address
  belongs_to :mailing_address, class_name: 'Address'
  belongs_to :account

  validates :type, presence: true
  validates :person, presence: true
  validates :address, presence: true
  validates :amount, numericality: { greater_than: 0 }

  serialize :serialized_address, JSON
  serialize :serialized_mailing_address, JSON

  before_validation :add_serialized_addresses, on: :create

  scope :completed, lambda { where.not(sent_at: nil).where(is_refund: false) }

  def type_name
    self.class.name.demodulize.underscore
  end

  def final_payment_amount
    amount - (fee||0.0) + (fee_adjustment||0.0)
  end

  # Move amount from the person's account to the cash out hold account
  def hold_amount!
    from_account = self.account
    to_account = Account::CashOutHold.instance

    transaction = Transaction::InternalTransfer.create!(
      audited: true,
      description: "#{self.class.name}(#{id}) - $#{amount} moved from #{from_account.class.name}(#{from_account.id}) to #{to_account.class.name}#{to_account.id}"
    )

    transaction.splits.create!(
      amount: -1 * amount,
      account: from_account,
      item: self
    )

    transaction.splits.create!(
      amount: amount,
      account: to_account,
      item: self
    )
  end

  # Release money from the hold account to the account specified
  def release_amount!
    hold_account = Account::CashOutHold.instance
    liability_account = Account::Liability.instance

    transaction = Transaction::InternalTransfer.create(
      audited: true,
      description: "#{self.class.name}(#{id}) - $#{amount} moved from #{hold_account.class.name}(#{hold_account.id}) to #{liability_account.class.name}(#{liability_account.id})"
    )

    transaction.splits.create(
      amount: -1 * amount,
      account: hold_account,
      item: self
    )

    transaction.splits.create(
      amount: amount,
      account: liability_account,
      item: self
    )
  end

  # Reject a cash out. moves money from hold back to person
  def refund!
    from_account = Account::CashOutHold.instance
    to_account = self.account

    transaction = Transaction::InternalTransfer.create!(
      audited: true,
      description: "#{self.class.name}(#{id}) - $#{amount} funds returned from #{from_account.class.name}#{from_account.id} to #{to_account.class.name}(#{to_account.id})"
    )

    transaction.splits.create!(
      amount: -1 * amount,
      account: from_account,
      item: self
    )

    transaction.splits.create!(
      amount: amount,
      account: to_account,
      item: self
    )
  end

  def sent?
    sent_at.present?
  end

  # Given a cash out type, create an instance from the correct class
  def self.parse(type, attrs={})
    klass = case type
    when 'paypal' then CashOut::Paypal
    when 'bitcoin' then CashOut::Bitcoin
    when 'check' then CashOut::Check
    when 'ripple' then CashOut::Ripple
    when 'mastercoin' then CashOut::Mastercoin
    else raise InvalidType
    end
    klass.new(attrs)
  end

  def send!
    raise NotImplementedError, 'Send is not implemented for this cash out method'
  end

private

  def add_serialized_addresses
    if address.present?
      self.serialized_address = address.attributes
    end

    if mailing_address.present?
      self.serialized_mailing_address = mailing_address.attributes
    end
  end

end
