require 'spec_helper'

describe Api::V2::CashOutsHelper do
    let(:person) { create(:person) } 
    let(:expected_cashout) { create(:paypal_cash_out, approved_at: DateTime.now, sent_at: nil, batch_id: nil, person: person, account_id: 1) }
    let(:pending_cashout) { create(:paypal_cash_out, approved_at: DateTime.now, sent_at: nil, batch_id: "1", person: person, account_id: 1) }
    let(:sent_cashout) { create(:paypal_cash_out, approved_at: DateTime.now, sent_at: DateTime.now, batch_id: "1", person: person, account_id: 1) }
    let(:manual_cashout) { create(:paypal_cash_out, approved_at: DateTime.now, sent_at: DateTime.now, batch_id: nil, person: person, account_id: 1) }
    let(:time) { "13 October 1993".to_datetime }

    describe "send_paypal" do
        it "should send to paypal" do
            @batch_double = double(PayPal::SDK::REST::Payout)

            expect(SecureRandom).to receive(:hex).with(8).and_return(1)

            expect(PayPal::SDK::REST::Payout).to receive(:new).with({
                :sender_batch_header => {
                    :sender_batch_id => 1,
                    :email_subject => "Sending Batch Payment 1",
                },
                :items => [{
                    :recipient_type => 'EMAIL',
                    :amount => {
                        :value => expected_cashout.amount,
                        :currency => 'USD'
                    },
                    :note => "Your cash out has been processed. Ref: #{expected_cashout.id}",
                    :receiver => expected_cashout.paypal_address,
                    :sender_item_id => expected_cashout.id,
                }]
            }).and_return(@batch_double)

            @batch_result = double(PayPal::SDK::REST::PayoutBatch)
            @batch_header = double(PayPal::SDK::REST::PayoutBatchHeader)

            expect(@batch_double).to receive(:create).and_return(@batch_result)
            expect(@batch_result).to receive(:batch_header).and_return(@batch_header)
            expect(@batch_header).to receive(:payout_batch_id).and_return(2)

            send_paypal!()
        end
    end

    describe "check paypal batch status" do
        it "should update successful pending payouts' status" do
            @batch_double = double(PayPal::SDK::REST::PayoutBatch)
            @payout_item_details = double(PayPal::SDK::REST::PayoutItemDetails)
            @payout_item = double(PayPal::SDK::REST::PayoutItem)
            @batch_header = double(PayPal::SDK::REST::PayoutBatchHeader)

            expect(PayPal::SDK::REST::Payout).to receive(:get).with(pending_cashout.batch_id).and_return(@batch_double)
            expect(@batch_double).to receive(:items).and_return([@payout_item_details])
            expect(@payout_item_details).to receive(:payout_item).and_return(@payout_item)
            expect(@payout_item).to receive(:sender_item_id).and_return(pending_cashout.id)

            expect(@batch_double).to receive(:batch_header).and_return(@batch_header)
            expect(@batch_header).to receive(:batch_status).and_return('SUCCESS')

            Timecop.freeze(time) do
                check_paypal_batch_status

                expect(pending_cashout.reload.sent_at).to eq(time)
            end
        end

        it "should update failed pending payouts' status" do
            @batch_double = double(PayPal::SDK::REST::PayoutBatch)
            @payout_item_details = double(PayPal::SDK::REST::PayoutItemDetails)
            @payout_item = double(PayPal::SDK::REST::PayoutItem)
            @batch_header = double(PayPal::SDK::REST::PayoutBatchHeader)

            expect(PayPal::SDK::REST::Payout).to receive(:get).with(pending_cashout.batch_id).and_return(@batch_double)
            expect(@batch_double).to receive(:items).and_return([@payout_item_details])
            expect(@payout_item_details).to receive(:payout_item).and_return(@payout_item)
            expect(@payout_item).to receive(:sender_item_id).and_return(pending_cashout.id)

            expect(@batch_double).to receive(:batch_header).and_return(@batch_header)
            expect(@batch_header).to receive(:batch_status).and_return('DENIED')

            Timecop.freeze(time) do
                check_paypal_batch_status

                expect(pending_cashout.reload.batch_id).to eq(nil)
                expect(pending_cashout.reload.sent_at).to eq(nil)
            end
        end
    end
end