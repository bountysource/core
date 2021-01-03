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

class PaymentNotification::StripeCreditCard < PaymentNotification

  def self.order_class
    Transaction::Payment::StripeCreditCard
  end

  def success?
    raw_json['status'] == 'succeeded'
  end

  def error_message
    success? ? nil : (raw_json['error']['message'] rescue "Unknown error")
  end

  def amount
    # already in cents
    Money.new(raw_json['amount'])
  end

  # we're inserting these directly after making the API call, so yes, it's verified
  def verified?
    true
  end

  def checkout_method
    payment_method
  end

end
