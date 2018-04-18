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

class PaymentNotification::BalancedPayments < PaymentNotification

  def params
    JSON.parse(raw_post).with_indifferent_access
  end

  def shopping_cart
    ShoppingCart.where(id: params[:meta][:shopping_cart_id]).first!
  end

  def txn_id
    params[:id]
  end

  def verified?
    return true
  end

  def amount
    Money.new(params['amount'])
  end

  def checkout_method
    raise "you did something wrong if you think this should work"
  end

end
