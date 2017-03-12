require 'spec_helper'

describe PaymentsController do

  render_views

  let!(:person) { create(:person) }
  let(:fundraiser) { create(:fundraiser) }
  let(:pledge) { build(:pledge, amount: 20, fundraiser: fundraiser, person: person) }
  let(:cart) { person.shopping_cart }

  before do
    pledge_attributes = ShoppingCart.item_to_attributes pledge
    cart.add_item pledge_attributes
  end

  let(:txn_id) { '9HV21269FCK60249' }
  let(:payment_status) { 'Completed' }
  let(:payment_type) { 'instant' }
  let(:handling_amount) { 0.0 }
  let(:mc_fee) { 0.25 }
  let(:mc_gross) { pledge.amount }

  let(:post_data) do
    {"business"=>Api::Application.config.paypal[:email],
      "charset"=>"windows-1252",
      "first_name"=>person.first_name,
      "handling_amount"=>handling_amount,
      "ipn_track_id"=>"3b8902618903",
      "item_name"=>"Bountysource Order #1",
      "item_number"=>cart.id,
      "last_name"=>person.last_name,
      "mc_currency"=>"USD",
      "mc_fee"=>mc_fee,
      "mc_gross"=>mc_gross,
      "notify_version"=>"3.7",
      "payer_email"=>person.email,
      "payer_id"=>"WESLTEG56ZUT8",
      "payer_status"=>"verified",
      "payment_date"=>1.minute.ago,
      "payment_fee"=>"0.88",
      "payment_gross"=>"20.00",
      "payment_status"=>payment_status,
      "payment_type"=>payment_type,
      "protection_eligibility"=>"Ineligible",
      "quantity"=>"1",
      "receiver_email"=>person.email,
      "receiver_id"=>"J6F3EFZTLH5JW",
      "residence_country"=>"US",
      "shipping"=>"0.00",
      "tax"=>"0.00",
      "test_ipn"=>"1",
      "transaction_subject"=>"oh hi",
      "txn_id"=>txn_id,
      "txn_type"=>"web_accept",
      "verify_sign"=>"AHy.ZmQnHLBY5C6.kl669Ql4MnrqAAuUuj-MQprK.dgzOgGVZpk4dGe-"}
  end

  before do
    # Set post body of request
    request.env['RAW_POST_DATA'] = post_data.to_param

    # Stub PayPal POST back verification response
    PaymentNotification::Paypal.any_instance.stub(:post_back) { 'VERIFIED' }
  end

  let(:action) { -> { post :paypal_ipn, post_data } }

  it 'should create payment notification' do
    expect(action).to change(PaymentNotification::Paypal, :count).by 1
  end

  it 'should create order' do
    expect(action).to change(Transaction::Order::Paypal, :count).by 1
  end

  it 'should not create duplicate orders' do
    expect {
      3.times { action[] }
    }.to change(Transaction::Order::Paypal, :count).by 1
  end

end
