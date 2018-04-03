# == Schema Information
#
# Table name: transactions
#
#  id                 :integer          not null, primary key
#  description        :text
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  audited            :boolean
#  type               :string           default("Transaction"), not null
#  person_id          :integer
#  checkout_method_id :integer
#  gross              :decimal(, )
#  items              :decimal(, )
#  fee                :decimal(, )      default(0.0)
#  processing_fee     :decimal(, )      default(0.0)
#  merch_fee          :decimal(, )      default(0.0)
#  liability          :decimal(, )      default(0.0)
#
# Indexes
#
#  index_transactions_on_checkout_method_id  (checkout_method_id)
#  index_transactions_on_fees                (fee)
#  index_transactions_on_gross               (gross)
#  index_transactions_on_items               (items)
#  index_transactions_on_liability           (liability)
#  index_transactions_on_merch_fee           (merch_fee)
#  index_transactions_on_person_id           (person_id)
#  index_transactions_on_processing_fee      (processing_fee)
#

require 'spec_helper'

describe Transaction::Order::Paypal do

  let(:person) { create :person }
  let(:cart) { person.shopping_cart }

  let(:issue) { create :issue }
  let(:bounty) { build :bounty, amount: 100, person: person, issue: issue }

  before do
    bounty_attributes = ShoppingCart.item_to_attributes bounty
    cart.add_item bounty_attributes
  end

  let(:notification) do
    notification = build :payment_notification_paypal
    allow(notification).to receive(:shopping_cart) { cart }
    notification.save! and notification
  end

  let(:create_order) { -> { Transaction::Order::Paypal.create_from_payment_notification notification: notification } }

  describe 'notification unverified' do

    before { allow(notification).to receive(:verified?) { false } }

    it 'should not create Transaction if notification invalid' do
      expect(create_order).not_to change(Transaction::Order::Paypal, :count)
    end

  end

  describe 'notification verified' do

    before { allow(notification).to receive(:verified?) { true } }

    it 'should create Transaction if notification valid' do
      expect(create_order).to change(Transaction::Order::Paypal, :count).by 1
    end

    it 'should only create one Transaction' do
      order = create_order[]
      order2 = create_order[]
      expect(order).to eq order2
    end

  end

end
