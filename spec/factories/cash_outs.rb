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
#  quickbooks_transaction_id  :integer
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

FactoryGirl.define do
  factory :cash_out, class: CashOut do
    type 'CashOut'
    association :address
    amount 100

    factory :paypal_cash_out, class: CashOut::Paypal do
      type 'CashOut::Paypal'
      paypal_address 'yolo@swag.com'
    end

    factory :bitcoin_cash_out, class: CashOut::Bitcoin do
      type 'CashOut::Bitcoin'
      bitcoin_address 'yoloswag420k'
    end

    factory :check_cash_out, class: CashOut::Check do
      type 'CashOut::Check'
    end
  end
end
