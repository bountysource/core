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

class PaymentNotification::Coinbase < PaymentNotification

  def params
    Oj.load(raw_post).with_indifferent_access
  end

  def order_params
    params['order']
  end

  def payout_params
    params['payout']
  end

  # Is this an order notification?
  def is_order?
    order_params.present?
  end

  # Is it a payout notification?
  def is_payout?
    payout_params.present?
  end

  # Both orders and payouts have IDs.
  def txn_id
    order_params.try(:[], 'id') || payout_params.try(:[], 'id')
  end

  def shopping_cart
    if is_order?
      ShoppingCart.find_by id: order_params['custom']
    end
  end

  def secret_token
    params['secret']
  end

  def secret_token_valid?
    secret_matched?
  end

  def order_completed?
    is_order? && order_params['status'] == 'completed'
  end

  # Is this a cancelled order?
  def order_canceled?
    is_order? && order_params['status'] == 'canceled'
  end

  # Get amount of order. Return cents as integer
  def amount currency=:usd
    if is_order?
      case currency
      when :usd
        order_params['total_native']['cents'].to_i
      when :btc
        order_params['total_btc']['cents'].to_i
      end
    end
  end

  def verified?
    # Protect against forgery by verifying secret token.
    return false unless secret_token_valid?

    # Ensure that this is an order notification.
    return false unless is_order?

    # Order status must be completed (not a cancelled order).
    return false unless order_completed? && !order_canceled?

    # Ensure amount for order matches cart gross.
    cart_gross = shopping_cart.calculate_gross
    cart_gross_cents = Money.new(cart_gross * 100, 'USD').cents
    return false unless cart_gross_cents == amount(:usd)

    true
  end

  def checkout_method
    Account::Coinbase.instance
  end

end
