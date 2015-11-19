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

class PaymentMethod::StripeCreditCard < PaymentMethod

  has_many :notifications, class_name: 'PaymentNotification::StripeCreditCard', foreign_key: :payment_method_id

  def self.order_class
    Transaction::Order::StripeCreditCard
  end

  def description
    "#{data['brand'] == "American Express" ? "xxxx-xxxxxx-x" : "xxxx-xxxx-xxxx-"}#{data['last4']} (#{data['brand']} expires #{data['exp_month']}/#{data['exp_year']})"
  end

  def charge(amount, descriptor='Bountysource')
    # api call to make charge
    response = Stripe::Charge.create({
      amount: amount.cents,
      currency: "usd",
      customer: person.stripe_customer_id,
      source: data['id'],
      statement_descriptor: descriptor,
      description: descriptor
    })

    # save it to the DB
    notifications.create!(
      raw_json: response.to_json,
      txn_id: response['id'] || 'error'
    )
  rescue Stripe::StripeError => e
    notifications.create!(
      raw_json: e.json_body,
      txn_id: (e.json_body[:error][:charge] rescue nil) || 'error'
    )
  end

end
