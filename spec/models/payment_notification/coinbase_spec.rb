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

require 'spec_helper'

describe PaymentNotification::Coinbase do

  let(:person) { create(:person) }
  let(:cart) { person.shopping_cart }
  let(:fundraiser) { create(:fundraiser) }
  let(:pledge) { build(:pledge, amount: 100, person: person, fundraiser: fundraiser) }

  # Add the Pledge to Person's shopping cart
  before do
    pledge_attributes = ShoppingCart.item_to_attributes pledge
    person.shopping_cart.add_item pledge_attributes
  end

  let(:button_code) { 'abc123' }

  let(:order_params) do
    {
      'order' => {
        'id' => '77Q4RP99',
        'created_at' => '2014-02-05T16:59:06-08:00',
        'status' => 'completed',
        'total_btc' => {
          'cents' => '1',
          'currency_iso' => 'BTC'
        },
        'total_native' => {
          'cents' => Money.new(cart.calculate_gross * 100, 'USD').cents,
          'currency_iso' => 'USD'
        },
        'custom' => cart.id,
        'receive_address' => '1D5eMWJDRDGNSSsZgQv9KBXmSAJyzdT4LZ',
        'button' => {
          'type' => 'buy_now',
          'name' => 'button',
          'description' => 'button',
          'id' => button_code
        },
        'transaction' => {
          'id' => '52f2de7e6c1dc07ac4000009',
          'hash' => nil,
          'confirmations' => 0
        }
      },
      'secret' => Api::Application.config.coinbase_secret
    }
  end

  let(:payout_params) do
    {
      'payout' => {
        'id' => '532bdc501e14ffec57000248',
        'type' => 'Sell',
        'created_at' => '2014-03-20T23:29:36-07:00',
        'payout_date' => '2014-03-25T23:29:36-07:00',
        'fees' => {
          'coinbase' => {
            'cents' => 57,
            'currency_iso' => 'USD'
          },
          'bank' => {
            'cents' => 15,
            'currency_iso' => 'USD'
          }
        },
        'transaction_id' => nil,
        'status' => 'Pending',
        'btc' => {
          'amount' => '0.00',
          'currency' => 'BTC'
        },
        'subtotal' => {
          'amount' => '56.74',
          'currency' => 'USD'
        },
        'total' => {
          'amount' => '56.02',
          'currency' => 'USD'
        },
        'description' => 'Sold 0.00 BTC for for $56.02.\n\nPayment will be sent to Your Bank ********1234 by Tuesday Mar 25, 2014. Thanks.',
        'payment_method' => {
          'id' => '52cef45d9b6faee5170000b3',
          'type' => 'BankAccount',
          'customer_name' => 'name',
          'obfuscated_name' => 'Your Bank ********1234'
        },
        'order_codes' => ['BXKZCXPU2', 'R7FABJ6T', 'NB6SG859']
      },
      'secret' => Api::Application.config.coinbase_secret
    }
  end

  let(:create_notification) { ->(params) { PaymentNotification::Coinbase.process_raw_post(params.to_json, secret_matched: true) } }

  it 'should load shopping cart from custom attribute' do
    notification = create_notification[order_params]
    expect(notification.shopping_cart).to eq(cart)
  end

  describe 'notification types' do

    it 'should be order' do
      notification = create_notification[order_params]
      expect(notification.is_order?).to be_truthy
    end

    it 'should be cancelled order' do
      order_params['order']['status'] = 'canceled'
      notification = create_notification[order_params]

      expect(notification.is_order?).to be_truthy
      expect(notification.order_canceled?).to be_truthy
    end

    it 'should be payout' do
      notification = create_notification[payout_params]

      expect(notification.is_order?).to be_falsey
      expect(notification.is_payout?).to be_truthy
    end

  end

  describe 'verification' do

    it 'should only verify if secret token valid' do
      notification = create_notification[order_params]
      notification.secret_matched = false
      expect(notification).not_to be_verified
    end

    it 'should only verify if order' do
      notification = create_notification[payout_params]
      allow(notification).to receive(:is_order?) { false }
      expect(notification).not_to be_verified
    end

    it 'should only verify if order completed' do
      notification = create_notification[order_params]
      allow(notification).to receive(:order_completed?) { false }
      expect(notification).not_to be_verified
    end

    it 'should only verify if amount matches cart gross' do
      notification = create_notification[order_params]
      allow(notification).to receive(:amount).with(:usd) { 100 }
      expect(notification).not_to be_verified
    end

    it 'should verify' do
      notification = create_notification[order_params]
      expect(notification).to be_verified
    end

  end

end
