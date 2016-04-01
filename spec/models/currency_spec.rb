# == Schema Information
#
# Table name: currencies
#
#  id         :integer          not null, primary key
#  type       :string(255)      not null
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
      Currency.stub(:rate_to_usd) do |symbol|
        case symbol
        when 'BLK'
          1000.0
        when 'BTC'
          900.0
        when 'MSC'
          800.0
        when 'XRP'
          700.0
        when 'USD'
          1
        end
      end
    end

    let(:tolerance) { 1.0/10**8 }

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
        expect(Currency.convert(amount, from, 'BTC')).to be_within(tolerance).of(amount / Currency.rate_to_usd('BTC'))
      end

      it 'should convert to BLK' do
        expect(Currency.convert(amount, from, 'BLK')).to be_within(tolerance).of(amount / Currency.rate_to_usd('BLK'))
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to be_within(tolerance).of(amount / Currency.rate_to_usd('MSC'))
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to be_within(tolerance).of(amount / Currency.rate_to_usd('XRP'))
      end
    end

    describe 'from BTC' do
      let(:amount) { 123 }
      let(:from) { 'BTC' }

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to eq amount
      end

      it 'should convert to BLK' do
        expect(Currency.convert(amount, from, 'BLK')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BTC') / Currency.rate_to_usd('BLK'))
      end

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BTC'))
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BTC') / Currency.rate_to_usd('MSC'))
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BTC') / Currency.rate_to_usd('XRP'))
      end
    end

    describe 'from BLK' do
      let(:amount) { 123 }
      let(:from) { 'BLK' }

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BLK') / Currency.rate_to_usd('BTC'))
      end

      it 'should convert to BLK' do
        expect(Currency.convert(amount, from, 'BLK')).to eq amount
      end

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BLK'))
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BLK') / Currency.rate_to_usd('MSC'))
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to be_within(tolerance).of(amount * Currency.rate_to_usd('BLK') / Currency.rate_to_usd('XRP'))
      end
    end

    describe 'from MSC' do
      let(:amount) { 123 }
      let(:from) { 'MSC' }

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to be_within(tolerance).of(amount * Currency.rate_to_usd('MSC') / Currency.rate_to_usd('BTC'))
      end

      it 'should convert to BLK' do
        expect(Currency.convert(amount, from, 'BLK')).to be_within(tolerance).of(amount * Currency.rate_to_usd('MSC') / Currency.rate_to_usd('BLK'))
      end

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to be_within(tolerance).of(amount * Currency.rate_to_usd('MSC'))
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to eq(amount)
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to be_within(tolerance).of(amount * Currency.rate_to_usd('MSC') / Currency.rate_to_usd('XRP'))
      end
    end

    describe 'from XRP' do
      let(:amount) { 123 }
      let(:from) { 'XRP' }

      it 'should convert to BTC' do
        expect(Currency.convert(amount, from, 'BTC')).to be_within(tolerance).of(amount * Currency.rate_to_usd('XRP') / Currency.rate_to_usd('BTC'))
      end

      it 'should convert to BLK' do
        expect(Currency.convert(amount, from, 'BLK')).to be_within(tolerance).of(amount * Currency.rate_to_usd('XRP') / Currency.rate_to_usd('BLK'))
      end

      it 'should convert to USD' do
        expect(Currency.convert(amount, from, 'USD')).to be_within(tolerance).of(amount * Currency.rate_to_usd('XRP'))
      end

      it 'should convert to MSC' do
        expect(Currency.convert(amount, from, 'MSC')).to be_within(tolerance).of(amount * Currency.rate_to_usd('XRP') / Currency.rate_to_usd('MSC'))
      end

      it 'should convert to XRP' do
        expect(Currency.convert(amount, from, 'XRP')).to eq(amount)
      end
    end

  end

end
