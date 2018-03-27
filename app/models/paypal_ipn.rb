# == Schema Information
#
# Table name: paypal_ipns
#
#  id                   :integer          not null, primary key
#  raw_post             :text             not null
#  txn_id               :string(255)      not null
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  payment_processed_at :datetime
#  payment_type         :string(255)
#  pending              :boolean          default(FALSE), not null
#  processed            :boolean          default(FALSE), not null
#  is_return            :boolean          default(FALSE), not null
#
# Indexes
#
#  index_paypal_ipns_on_is_return     (is_return)
#  index_paypal_ipns_on_payment_type  (payment_type)
#  index_paypal_ipns_on_pending       (pending)
#  index_paypal_ipns_on_processed     (processed)
#  index_paypal_ipns_on_txn_id        (txn_id)
#

# PayPal IPN Reference: https://developer.paypal.com/webapps/developer/docs/classic/ipn/integration-guide/IPNIntro/
class PaypalIpn < ActiveRecord::Base
  has_many :splits, :as => :item
  has_many :transactions, :through => :splits
  belongs_to :order, class_name: "Transaction::Order"

  class Error < RuntimeError; end

  # takes a raw_post body, parses it, verifies it with paypal
  # ALWAYS creates an IPN object
  def self.process_raw_post(raw_post)
    params = Rack::Utils.parse_nested_query(raw_post)

    paypal_ipn = create!(
      txn_id: params['txn_id'],
      payment_type: params['payment_type'],
      raw_post: raw_post
    )

    raise Error, "didn't verify" unless paypal_ipn.verified?
    raise Error, "currency not 'USD'" unless params['mc_currency'] == 'USD'
    raise Error, "business email not correct" unless params['business'] == Api::Application.config.paypal[:email]

    # TODO enable gross check of cart with mc_gross before creating Items.
    #person = Person.find_by_perma_reference(paypal_ipn.custom_params['person_id'])
    #cart_gross = person.shopping_cart.gross(Account::Paypal.instance)
    #raise Error, "gross does not match" unless params['mc_gross'].to_f == cart_gross.to_f

    if params['payment_status'] == 'Completed'
      if params['payment_type'] == 'instant'
        # Safely check to see if a Transaction::Order::Paypal has been created yet.
        #
        # If we receive an IPN for an empty shopping cart, just return successfully.
        # When PayPal sends us more than one IPN, the first successful one to arrive
        # will create the Transaction::Order and clear the person's ShoppingCart.
        # Meanwhile, The IPN message has the old ShoppingCart token, which will NOT
        # match against an empty cart when we receive it.
        #
        # If we don't accept these IPNs, they get backed up and PayPal sends us mean
        # emails threatening to revoke our access to IPN. Don't let that happen!
        if !paypal_ipn.get_transaction && !paypal_ipn.person.shopping_cart.empty?
          paypal_ipn.checkout_cart
        end

        # mark it as processed
        paypal_ipn.update_attributes processed: true
      elsif params['payment_type'] == 'echeck'
        # an echeck payment was completed! mark as processed and log the date
        Rails.logger.error "Received POST for echeck clearance PaypalIpn(txn_id: #{paypal_ipn.txn_id})"

        paypal_ipn.update_attributes(pending: false, processed: true, payment_processed_at: DateTime.now)
      end

    elsif params['payment_status'] == 'Pending' && params['payment_type'] == 'echeck' && params['pending_reason'] == 'echeck'
      # an echeck payment was made, treat the same as if it was an instant payment,
      paypal_ipn.checkout_cart
      paypal_ipn.update_attributes pending: true

    elsif params['payment_status'] == 'Denied'
      # This happens when a payment is cancelled, paypal sends us an IPN. don't raise.
      #
      # From PayPal docs:
      # "The payment was denied. This happens only if the payment was previously pending because of
      # one of the reasons listed for the pending_reason variable or the Fraud_Management_Filters_x variable."

    else
      raise Error, "Unexpected Payment Status"
    end

    paypal_ipn
  end

  def params
    @params ||= Rack::Utils.parse_nested_query(raw_post).with_indifferent_access
  end

  def custom_params
    @custom_params ||= Rack::Utils.parse_nested_query(params[:custom]).with_indifferent_access
  end

  def get_redirect_url
    order and Api::Application.config.www_receipt_url % order.shopping_cart_id
  end

  def verified?
    uri = URI.parse(Api::Application.config.paypal[:checkout_url])
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Post.new("/cgi-bin/webscr?cmd=_notify-validate")
    request.body = raw_post
    http.request(request).body == "VERIFIED"
  end

  def checkout_cart
    person = Person.find_by_perma_reference(custom_params[:person_id])
    token = custom_params[:token]

    if person.shopping_cart.token_valid?(token)
      Transaction::Order::Paypal.create_from_cart_and_checkout_method(person.shopping_cart, Account::Paypal.instance, source: self)
    else
      raise Error, "Person(#{person.id}) cart no longer valid"
    end
  end

  def get_transaction!
    transaction_ids = Split.where("item_type='PaypalIpn' and item_id in (?)", self.class.where(txn_id: txn_id).pluck(:id)).pluck(:transaction_id).uniq

    unless transaction_ids.count == 1
      raise Error, "#{txn_id}: expected one Transaction, found #{transaction_ids.count}"
    end

    Transaction::Order::Paypal.where(id: transaction_ids).first
  end

  def get_transaction
    get_transaction! rescue nil
  end

  def person
    Person.find_by_perma_reference(custom_params['person_id'])
  end
end
