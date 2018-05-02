# == Schema Information
#
# Table name: cash_outs
#
#  id                         :integer          not null, primary key
#  type                       :string           not null
#  person_id                  :integer          not null
#  address_id                 :integer          not null
#  mailing_address_id         :integer
#  bitcoin_address            :string
#  paypal_address             :string
#  remote_ip                  :string
#  user_agent                 :string
#  amount                     :decimal(, )
#  sent_at                    :datetime
#  us_citizen                 :boolean
#  created_at                 :datetime
#  updated_at                 :datetime
#  serialized_address         :text
#  serialized_mailing_address :text
#  fee                        :decimal(, )
#  fee_adjustment             :decimal(, )
#  ripple_address             :string
#  mastercoin_address         :string
#  is_refund                  :boolean          default(FALSE), not null
#  account_id                 :integer          not null
#  quickbooks_transaction_id  :integer
#  is_fraud                   :boolean          default(FALSE), not null
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

require 'spec_helper'

describe CashOut::Mastercoin do
  it { is_expected.to validate_presence_of(:mastercoin_address) }
end
