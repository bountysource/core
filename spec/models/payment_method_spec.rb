# == Schema Information
#
# Table name: payment_methods
#
#  id         :integer          not null, primary key
#  type       :string           not null
#  person_id  :integer          not null
#  data       :json             not null
#  created_at :datetime
#  updated_at :datetime
#

require 'spec_helper'

describe PaymentMethod do

  before do
    # stup out paypal API to always return a success
    allow(PaymentMethod::PaypalReferenceTransaction).to receive(:api) { |params| params.merge('PAYMENTSTATUS' => 'Completed') }
  end

  describe '.create_all_pending_invoices!' do
    it "should do nothing if there aren't any new invoices" do
      expect_any_instance_of(PaymentMethod).to receive(:create_pending_invoices!).never
      expect(SupportLevel.needs_to_be_invoiced.count).to eq(0)
      PaymentMethod.create_all_pending_invoices!
    end

    it "should call create_pending_invoices! on payment_method" do
      expect_any_instance_of(PaymentMethod).to receive(:create_pending_invoices!).once
      create(:support_level)
      expect(SupportLevel.needs_to_be_invoiced.count).to eq(1)
      PaymentMethod.create_all_pending_invoices!
    end

    it "should create two new invoices for two new support levels" do
      expect {
        sl1 = create(:support_level)
        sl2 = create(:support_level)
        PaymentMethod.create_all_pending_invoices!
      }.to change{ShoppingCart.count}.by(2)
    end

    it "should create one new invoice for support levels with same payment method" do
      expect {
        sl1 = create(:support_level)
        sl2 = create(:support_level, payment_method: sl1.payment_method)
        PaymentMethod.create_all_pending_invoices!
      }.to change{ShoppingCart.count}.by(1)
    end
  end

  describe '.settle_all_pending_invoices!' do
    it "should do nothing when there aren't any invoices" do
      expect(ShoppingCart.ready_to_be_billed.count).to eq(0)
      expect{PaymentMethod.settle_all_pending_invoices!}.to change{SupportLevelPayment.count}.by(0)
    end

    it "should process a new invoice" do
      create(:support_level).payment_method.create_pending_invoices!
      expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
      expect{PaymentMethod.settle_all_pending_invoices!}.to change{SupportLevelPayment.count}.by(1)
    end
  end

  describe '#create_pending_invoices!' do
    let(:support_level) { create(:support_level) }
    it "should only charge once initially, and then after the next month" do
      # new support level created on May 2nd, shouldn't have been charged yet since cron didn't run
      Timecop.freeze(Time.parse("2015-05-02 07:20:53")) do
        expect(support_level.amount.to_i).to be(10)
        expect(support_level.last_invoice_ends_at).to be_nil
        expect(support_level.payments.count).to be(0)
      end

      # hour later, cron kicks in. expects order for current month
      Timecop.freeze(Time.parse("2015-05-02 08:20:53")) do
        expect{PaymentMethod.create_and_settle_all_pending_invoices!}.to change{ShoppingCart.count}.by(1)

        support_level.reload
        expect(support_level.last_invoice_ends_at).to eq(Date.parse("2015-05-31"))
        expect(support_level.payments.count).to be(1)
      end

      # hour later, cron kicks in again. expect no change
      Timecop.freeze(Time.parse("2015-05-02 09:20:53")) do
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.not_to change{ShoppingCart.count}
      end

      # month later, cron kicks in again. expect no change
      Timecop.freeze(Time.parse("2015-06-02 09:20:53")) do
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.not_to change{ShoppingCart.count}
      end

      # month later end of month, cron kicks in again. expect no change
      Timecop.freeze(Time.parse("2015-06-30 23:59:59")) do
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.not_to change{ShoppingCart.count}
      end

      # beginning of month 2, charge for month 1
      Timecop.freeze(Time.parse("2015-07-01 00:00:00")) do
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
        support_level.reload
        expect(support_level.last_invoice_ends_at).to eq(Date.parse("2015-06-30"))
        expect(support_level.payments.count).to be(2)
      end

      # part way through month 2, do nothing
      Timecop.freeze(Time.parse("2015-07-02 00:00:00")) do
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.not_to change{ShoppingCart.count}
      end

      # beginning of month 3, bill for month 2
      Timecop.freeze(Time.parse("2015-08-02 00:00:00")) do
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
        support_level.reload
        expect(support_level.last_invoice_ends_at).to eq(Date.parse("2015-07-31"))
        expect(support_level.payments.count).to be(3)
      end
    end

    it "should credit previous payments for the same month" do
      expect(support_level.amount.to_i).to be(10)
      expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
      expect(ShoppingCart.last.calculate_gross.to_i).to be(10)

      support_level.reload.update_attributes!(amount: 15, status: 'active', last_invoice_starts_at: nil, last_invoice_ends_at: nil)
      expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
      expect(ShoppingCart.last.calculate_gross.to_i).to be(5)

      support_level.reload.update_attributes!(amount: 5, status: 'active', last_invoice_starts_at: nil, last_invoice_ends_at: nil)
      expect { PaymentMethod.create_and_settle_all_pending_invoices! }.not_to change{ShoppingCart.count}

      support_level.reload.update_attributes!(amount: 25, status: 'active', last_invoice_starts_at: nil, last_invoice_ends_at: nil)
      expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
      expect(ShoppingCart.last.calculate_gross.to_i).to be(10)
    end

    it "should combine two support levels into one order" do
      support_level2 = create(:support_level, payment_method: support_level.payment_method, person: support_level.person)
      expect(support_level.amount.to_i).to be(10)
      expect(support_level2.amount.to_i).to be(10)
      expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
      expect(ShoppingCart.last.calculate_gross.to_i).to be(20)
    end

    it "should charge $5 minimum and apply credits to later months" do
      Timecop.freeze(Time.parse("2015-05-02 07:20:53")) do
        support_level.update_attributes!(amount: 1.00)
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
        support_level.reload
        expect(ShoppingCart.last.calculate_gross.to_i).to be(1)
        expect(support_level.payment_method.notifications.count).to be(1)
        expect(support_level.payment_method.notifications.first.amount.to_f.to_i).to be(5)
        expect(support_level.payment_method.account_balance.to_i).to be(4)
      end

      Timecop.freeze(Time.parse("2015-07-01 00:00:00")) do
        expect { PaymentMethod.create_and_settle_all_pending_invoices! }.to change{ShoppingCart.count}.by(1)
        support_level.reload
        expect(ShoppingCart.last.calculate_gross.to_i).to be(1)
        expect(support_level.payment_method.notifications.count).to be(1)
        expect(support_level.payment_method.account_balance.to_i).to be(3)
      end
    end
  end

  describe '#settle_pending_invoices!' do
    let(:support_level) { create(:support_level) }

    it "should charge a card and mark invoices as paid" do
      support_level.payment_method.create_pending_invoices!
      expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
      cart = ShoppingCart.ready_to_be_billed.first
      expect(Transaction.count).to eq(0)
      expect{support_level.payment_method.settle_pending_invoices!}.to change{Transaction.count}.by(2)
      expect(ShoppingCart.ready_to_be_billed.count).to eq(0)

      expect(cart.reload.status).to eq('paid')
    end

    it "should mark everything as unpaid if it fails" do
      support_level.payment_method.create_pending_invoices!

      expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
      cart = ShoppingCart.ready_to_be_billed.first

      Timecop.freeze(Time.parse("2015-05-15 00:00:00")) do
        notif = support_level.payment_method.notifications.create!(txn_id: 'error', raw_json: { 'ACK' => 'Failure' })
        expect(support_level.payment_method).to receive(:charge).once.and_return(notif)
        support_level.payment_method.settle_pending_invoices!

        expect(cart.reload.status).to eq('unpaid')
        expect(support_level.reload.status).to eq('unpaid')

        expect(ShoppingCart.ready_to_be_billed.count).to eq(0)
      end

      Timecop.freeze(Time.parse("2015-07-01 00:00:00")) do
        support_level.payment_method.create_pending_invoices!
        expect(ShoppingCart.ready_to_be_billed.count).to eq(0)
      end
    end

    it "should reactivate if you change payment methods and the payment goes through" do
      support_level.payment_method.create_pending_invoices!

      expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
      cart = ShoppingCart.ready_to_be_billed.first

      Timecop.freeze(Time.parse("2015-05-15 00:00:00")) do
        notif = support_level.payment_method.notifications.create!(txn_id: 'error', raw_json: { 'ACK' => 'Failure' })
        expect(support_level.payment_method).to receive(:charge).once.and_return(notif)
        support_level.payment_method.settle_pending_invoices!
        expect(cart.reload.status).to eq('unpaid')
        expect(support_level.reload.status).to eq('unpaid')
      end

      Timecop.freeze(Time.parse("2015-05-17 00:00:00")) do
        expect(SupportLevel.needs_to_be_invoiced.count).to eq(0)
        expect(ShoppingCart.ready_to_be_billed.count).to eq(0)
      end

      Timecop.freeze(Time.parse("2015-05-19 00:00:00")) do
        support_level.update_attributes(status: 'active')
        expect(SupportLevel.needs_to_be_invoiced.count).to eq(0)
        expect(ShoppingCart.ready_to_be_billed.count).to eq(0)
      end

    end

    # it "should prevent against double invoicing" do
    #   # if you update a payment method, and then an invoice gets created, and you update again, and then they both get settled.... you've will get billed twice!?
    #   raise "TODO"
    # end

    # NOTE-- retries are no longer supported
    # it "should mark the support level as unpaid after enough retries" do
    #   support_level.payment_method.create_pending_invoices!
    #
    #   expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
    #   cart = ShoppingCart.ready_to_be_billed.first
    #
    #   fail_at_billing = lambda {
    #     notif = support_level.payment_method.notifications.create!(txn_id: 'error', raw_json: { 'ACK' => 'Failure' })
    #     expect(support_level.payment_method).to receive(:charge).and_return(notif)
    #     support_level.payment_method.settle_pending_invoices!
    #   }
    #
    #   expect(support_level.status).to eq('active')
    #
    #   Timecop.freeze(Time.parse("2015-05-15 00:00:00")) do
    #     expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
    #     fail_at_billing.call
    #     expect(cart.reload.billing_attempts).to eq(1)
    #     expect(cart.reload.status).to eq('open')
    #     expect(support_level.reload.status).to eq('past_due')
    #   end
    #
    #   Timecop.freeze(Time.parse("2015-05-17 00:00:00")) do
    #     expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
    #     fail_at_billing.call
    #     expect(cart.reload.billing_attempts).to eq(2)
    #     expect(cart.reload.status).to eq('open')
    #     expect(support_level.reload.status).to eq('past_due')
    #   end
    #
    #   Timecop.freeze(Time.parse("2015-05-19 00:00:00")) do
    #     expect(ShoppingCart.ready_to_be_billed.count).to eq(1)
    #     fail_at_billing.call
    #     expect(cart.reload.billing_attempts).to eq(3)
    #     expect(cart.reload.status).to eq('unpaid')
    #     expect(support_level.reload.status).to eq('unpaid')
    #   end
    #
    #   Timecop.freeze(Time.parse("2015-06-01 00:00:00")) do
    #     expect{support_level.payment_method.create_pending_invoices!}.to change{ShoppingCart.count}.by(0)
    #   end
    # end

  end

end
