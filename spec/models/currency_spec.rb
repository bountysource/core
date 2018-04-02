# == Schema Information
#
# Table name: currencies
#
#  id         :integer          not null, primary key
#  type       :string           not null
#  value      :decimal(, )      not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_currencies_on_type   (type)
#  index_currencies_on_value  (value)
#

require 'spec_helper'

describe Currency do

  describe 'convert' do

    before do
      allow(Currency).to receive(:btc_rate) { 900.0 }
      allow(Currency).to receive(:msc_rate) { 800.0 }
      allow(Currency).to receive(:xrp_rate) { 700.0 }
    end

    it 'should take string and return amount' do
      expect(Currency.convert('123.456789', 'USD', 'BTC')).to be_a Float
    end

    it 'should take float and return amount' do
      expect(Currency.convert(123.456789, 'USD', 'BTC')).to be_a Float
    end

    describe 'error handling nil budget value' do
      it 'should not explode when converting nil value from XRP to USD' do
        expect(Currency.convert(nil, 'XRP', 'USD')).to eq(0.0)
      end 

      it 'should not explode when converting empty string from XRP to USD' do
        expect(Currency.convert("", 'XRP', 'USD')).to eq(0.0)
      end

      it 'should not explode when converting 0 from XRP to USD' do
        expect(Currency.convert(0, 'XRP', 'USD')).to eq(0.0)
      end
    end

    describe 'from USD' do
      let(:amount) { 1 }
      let(:from) { 'USD' }

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to eq amount
      end

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to eq (amount / Currency.btc_rate)
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to eq (amount / Currency.msc_rate)
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to eq (amount / Currency.xrp_rate)
      end
    end

    describe 'from BTC' do
      let(:amount) { 123 }
      let(:from) { 'BTC' }
      let(:usd_amount) { 1 }

      before do
        allow(Currency).to receive(:btc_to_usd).and_return(usd_amount)
      end

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to eq amount
      end

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to eq(amount * Currency.btc_rate)
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to eq(usd_amount * Currency.msc_rate)
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to eq(usd_amount * Currency.xrp_rate)
      end
    end

    describe 'from MSC' do
      let(:amount) { 123 }
      let(:from) { 'MSC' }
      let(:usd_amount) { 1 }

      before do
        allow(Currency).to receive(:msc_to_usd).and_return(usd_amount)
      end

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to eq(usd_amount * Currency.btc_rate)
      end

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to eq(amount * Currency.msc_rate)
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to eq(amount)
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to eq(usd_amount * Currency.xrp_rate)
      end
    end

    describe 'from XRP' do
      let(:amount) { 123 }
      let(:from) { 'XRP' }
      let(:usd_amount) { 1 }

      before do
        allow(Currency).to receive(:xrp_to_usd).and_return(usd_amount)
      end

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to eq(usd_amount * Currency.btc_rate)
      end

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to eq(amount * Currency.xrp_rate)
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to eq(usd_amount * Currency.msc_rate)
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to eq(amount)
      end
    end

  end

end
