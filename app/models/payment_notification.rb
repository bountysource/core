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

class PaymentNotification < ApplicationRecord
  belongs_to :order, class_name: 'Transaction::Order'
  belongs_to :shopping_cart
  belongs_to :payment_method

  class Error < StandardError ; end
  class Unimplemented < Error ; end
  class DuplicateOrders < Error ; end
  class VerificationFailed < Error ; end

  def self.process_raw_post(raw_post, secret_matched: nil)
    notification = new raw_post: raw_post
    notification.txn_id = notification.txn_id

    # If our only method of verifying the IPN is via a secret token on the IPN URL query,
    # set the flag for it. Defaults to nil for processors that have a POST-back system.
    notification.secret_matched = secret_matched

    notification.save! and notification
  end

  def self.admin_search(query)
    transaction_ids = where(txn_id: query).map(&:shopping_cart).compact.map(&:order_id)
    Transaction.where(id: transaction_ids)
  end

  def params
    raise Unimplemented
  end

  # Are we allowed to finalize the order based on IPN params?
  def verified?
    raise Unimplemented
  end

  # Checkout method for the payment notification type.
  # Returns instance of Account
  def checkout_method
  end

end
