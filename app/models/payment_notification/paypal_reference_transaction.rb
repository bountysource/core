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

class PaymentNotification::PaypalReferenceTransaction < PaymentNotification

  def self.order_class
    Transaction::Payment::PaypalReferenceTransaction
  end

  # only "success" if ACK==success AND it was an instant completed (non-pending) transaction
  def success?
    raw_json['PAYMENTSTATUS'] == 'Completed'
  end

  def error_message
    success? ? nil : (raw_json['L_LONGMESSAGE0'] rescue "Unknown error")
  end

  def amount
    Money.new(raw_json['AMT'].to_f*100)
  end

  # we're inserting these directly after making the API call, so yes, it's verified
  def verified?
    true
  end

  def checkout_method
    payment_method
  end

  # def person
  #   @person ||= shopping_cart.person
  # end
  #
  # def instant?
  #   params['payment_type'] == 'instant'
  # end
  #
  # def echeck?
  #   params['payment_type'] == 'echeck'
  # end
  #
  # def pending?
  #   params['payment_status'] == 'Pending'
  # end


end
