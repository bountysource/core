# == Schema Information
#
# Table name: cash_outs
#
#  id                         :integer          not null, primary key
#  type                       :string(255)      not null
#  person_id                  :integer          not null
#  address_id                 :integer          not null
#  mailing_address_id         :integer
#  bitcoin_address            :string(255)
#  paypal_address             :string(255)
#  remote_ip                  :string(255)
#  user_agent                 :string(255)
#  amount                     :decimal(, )
#  sent_at                    :datetime
#  us_citizen                 :boolean
#  created_at                 :datetime
#  updated_at                 :datetime
#  serialized_address         :text
#  serialized_mailing_address :text
#  fee                        :decimal(, )
#  fee_adjustment             :decimal(, )
#  ripple_address             :string(255)
#  mastercoin_address         :string(255)
#  is_refund                  :boolean          default(FALSE), not null
#  account_id                 :integer          not null
#  quickbooks_transaction_id  :integer
#  is_fraud                   :boolean          default(FALSE), not null
#
# Indexes
#
#  index_cash_outs_on_address_id          (address_id)
#  index_cash_outs_on_amount              (amount)
#  index_cash_outs_on_bitcoin_address     (bitcoin_address)
#  index_cash_outs_on_mailing_address_id  (mailing_address_id)
#  index_cash_outs_on_paypal_address      (paypal_address)
#  index_cash_outs_on_person_id           (person_id)
#  index_cash_outs_on_sent_at             (sent_at)
#  index_cash_outs_on_type                (type)
#  index_cash_outs_on_us_citizen          (us_citizen)
#

require 'spec_helper'

describe CashOut do
  describe 'parse' do
    shared_examples_for 'a cash out method' do
      let(:action) { CashOut.parse(type) }

      it 'should instantiate class' do
        expect(action).to be_a(described_class)
      end
    end

    it 'should raise error on nil type' do
      expect{ CashOut.parse(nil) }.to raise_error(CashOut::InvalidType)
    end

    it 'should raise error on invalid type' do
      expect{ CashOut.parse('meeeeeep') }.to raise_error(CashOut::InvalidType)
    end

    describe 'Paypal' do
      let(:type) { 'paypal' }
      let(:klass) { CashOut::Paypal }
      it_behaves_like 'a cash out method'
    end

    describe 'Bitcoin' do
      let(:type) { 'bitcoin' }
      let(:klass) { CashOut::Bitcoin }
      it_behaves_like 'a cash out method'
    end

    describe 'Check' do
      let(:type) { 'check' }
      let(:klass) { CashOut::Check }
      it_behaves_like 'a cash out method'
    end

    describe 'Ripple' do
      let(:type) { 'ripple' }
      let(:klass) { CashOut::Ripple }
      it_behaves_like 'a cash out method'
    end

    describe 'Mastercoin' do
      let(:type) { 'mastercoin' }
      let(:klass) { CashOut::Mastercoin }
      it_behaves_like 'a cash out method'
    end
  end
end
