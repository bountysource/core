# == Schema Information
#
# Table name: accounts
#
#  id                      :integer          not null, primary key
#  type                    :string(255)      default("Account"), not null
#  description             :string(255)      default(""), not null
#  currency                :string(255)      default("USD"), not null
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  owner_id                :integer
#  owner_type              :string(255)
#  standalone              :boolean          default(FALSE)
#  override_fee_percentage :integer
#
# Indexes
#
#  index_accounts_on_item_id    (owner_id)
#  index_accounts_on_item_type  (owner_type)
#  index_accounts_on_type       (type)
#

class Account::Paypal < Account

  def self.liability?
    false
  end

  def display_name
    "PayPal"
  end

  def self.can_compute_processing_fee?
    false
  end

  def self.order_class
    Transaction::Order::Paypal
  end

  def self.refund_class
    Transaction::Refund::Paypal
  end

  def self.cash_out_class
    Transaction::CashOut::Paypal
  end

end
