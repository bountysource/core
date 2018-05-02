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

class PaymentNotification::Paypal < PaymentNotification

  def params
    @params ||= Rack::Utils.parse_nested_query(raw_post).with_indifferent_access
  end

  def txn_id
    params['txn_id']
  end

  def shopping_cart
    @shopping_cart ||= ShoppingCart.find_by(id: params['item_number'])
  end

  def person
    @person ||= shopping_cart.person
  end

  def completed?
    params['payment_status'] == 'Completed'
  end

  def instant?
    params['payment_type'] == 'instant'
  end

  def echeck?
    params['payment_type'] == 'echeck'
  end

  def pending?
    params['payment_status'] == 'Pending'
  end

  # If true, it is safe to fulfill the Order. Conditions:
  # The payment status is 'Completed'
  # The gross of the shopping cart matches that of the IPN
  # The business email matches ours
  # POST back to PayPal is successful
  def verified?
    # Ensure that the payment was completed
    return false unless completed?
    # Only allow echeck and instant
    return unless instant? || echeck?

    # check presence of txn_id
    return false unless txn_id

    # Shopping cart gross verification
    cart_gross = shopping_cart.calculate_gross
    return false unless cart_gross.to_f == params['mc_gross'].to_f

    # Business email verification
    return false unless Api::Application.config.paypal[:email] == params['business']

    # Check for IPN POST back verification or PDT Success
    return false unless post_back(raw_post) == 'VERIFIED' || raw_post.start_with?("SUCCESS")

    true
  end

  def checkout_method
    Account::Paypal.instance
  end

  # find or create the order
  def process_order
    Transaction::Order::Paypal.find_by_id(shopping_cart.order_id) || Transaction::Order::Paypal.create_from_payment_notification(notification_id: self.id)
  end

  private

  # POST back to Paypal to protect against spoofing
  def post_back(raw_post)
    if Rails.env.test?
      raise "PaymentNotification::Paypal(#{id}) trying to POST back verify in test. Stub out :post_back to 'VERIFIED' for successful verification"
    end

    uri = URI.parse(Api::Application.config.paypal[:checkout_url])
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Post.new("/cgi-bin/webscr?cmd=_notify-validate")
    request.body = raw_post
    http.request(request).body
  end

end
