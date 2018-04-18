# == Schema Information
#
# Table name: payment_notifications
#
#  id                :integer          not null, primary key
#  type              :string           not null
#  txn_id            :string
#  raw_post          :text
#  order_id          :integer
#  created_at        :datetime
#  updated_at        :datetime
#  secret_matched    :boolean
#  payment_method_id :integer
#  raw_json          :json
#
# Indexes
#
#  index_payment_notifications_on_order_id  (order_id)
#  index_payment_notifications_on_txn_id    (txn_id)
#  index_payment_notifications_on_type      (type)
#

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryBot.define do
  factory :payment_notification do
    txn_id '9HV21269FCK60249'

    factory :payment_notification_paypal, class: PaymentNotification::Paypal do
      raw_post 'business=warren_1346817141_biz%40badger.com&charset=windows-1252&first_name=John&handling_amount=0.0&ipn_track_id=3b8902618903&item_name=Bountysource+Order+%231&item_number=107&last_name=Doe&mc_currency=USD&mc_fee=0.25&mc_gross=25.25&notify_version=3.7&payer_email=qa%2Btest-1%40bountysource.com&payer_id=WESLTEG56ZUT8&payer_status=verified&payment_date=2014-04-06+05%3A06%3A30+UTC&payment_fee=0.88&payment_gross=20.00&payment_status=Completed&payment_type=instant&protection_eligibility=Ineligible&quantity=1&receiver_email=qa%2Btest-1%40bountysource.com&receiver_id=J6F3EFZTLH5JW&residence_country=US&shipping=0.00&tax=0.00&test_ipn=1&transaction_subject=oh+hi&txn_id=txn_id=9HV21269FCK60249&txn_type=web_accept&verify_sign=AHy.ZmQnHLBY5C6.kl669Ql4MnrqAAuUuj-MQprK.dgzOgGVZpk4dGe-'
    end
  end
end
