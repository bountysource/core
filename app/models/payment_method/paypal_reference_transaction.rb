# == Schema Information
#
# Table name: payment_methods
#
#  id         :integer          not null, primary key
#  type       :string(255)      not null
#  person_id  :integer          not null
#  data       :json             not null
#  created_at :datetime
#  updated_at :datetime
#

class PaymentMethod::PaypalReferenceTransaction < PaymentMethod

  has_many :notifications, class_name: 'PaymentNotification::PaypalReferenceTransaction', foreign_key: :payment_method_id

  def self.order_class
    Transaction::Order::PaypalReferenceTransaction
  end

  # required return_url, optional cancel_url
  def self.create_reference_token(options)
    response = self.api(
      'METHOD' => 'SetExpressCheckout',
      'PAYMENTREQUEST_0_AMT' => 0,
      'PAYMENTREQUEST_0_PAYMENTACTION' => 'AUTHORIZATION',
      'PAYMENTREQUEST_0_CURRENCYCODE' => 'USD',
      'L_BILLINGTYPE0' => 'MerchantInitiatedBilling',
      'L_BILLINGAGREEMENTDESCRIPTION0' => 'Bountysource',
      'LOGOIMG' => 'https://d2bbtvgnhux6eq.cloudfront.net/assets/Bountysource-190x60-9fd86d15f140ed36d98c9bc719264197.png',
      'returnUrl' => options[:return_url],
      'cancelUrl' => options[:return_url] + (options[:return_url]['?'] ? '&' : '?') + 'canceled=true'
    )

    return response['TOKEN']
  end

  def self.url_from_token(token)
    File.join(Api::Application.config.paypal[:checkout_url], "cgi-bin/webscr?cmd=_express-checkout&token=#{token}")
  end

  def self.convert_token_to_billing_agreement(token)
    checkout_details = self.api(
      'METHOD' => 'GetExpressCheckoutDetails',
      'TOKEN' => token
    )

    # they canceled rather than accepted
    return nil if checkout_details['BILLINGAGREEMENTACCEPTEDSTATUS'] == '0'

    billing_agreement = self.api(
      'METHOD' => 'CreateBillingAgreement',
      'TOKEN' => token
    )

    checkout_details.merge(billing_agreement)
  end

  def description
    "PayPal (#{data['EMAIL']})"
  end

  def charge(amount, descriptor='Bountysource')
    raise "Hundred million is a bit steep..." unless amount < 10**8

    # api call to make charge
    response = self.class.api(
      'METHOD' => 'DoReferenceTransaction',
      'REFERENCEID' => data['BILLINGAGREEMENTID'],
      'PAYMENTACTION' => 'Sale',
      'AMT' => amount.to_s,
      'SOFTDESCRIPTOR' => descriptor,
      'DESC' => descriptor
      #'NOTIFYURL' => ''
    )

    # save it to the DB
    notifications.create!(
      raw_json: response.to_json,
      txn_id: response['TRANSACTIONID'] || 'error'
    )
  end

protected

  def self.api(params)
    params = params.merge(
      'USER' => Api::Application.config.paypal[:api_username],
      'PWD' => Api::Application.config.paypal[:api_password],
      'SIGNATURE' => Api::Application.config.paypal[:api_signature],
      'VERSION' => 86
    )

    response = HTTParty.get(Api::Application.config.paypal[:api_url] + '?' + params.to_param).response.body
    Rack::Utils.parse_query(response)
  end

end
