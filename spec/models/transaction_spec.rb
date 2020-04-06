# == Schema Information
#
# Table name: transactions
#
#  id                 :integer          not null, primary key
#  description        :text
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#  audited            :boolean
#  type               :string(255)      default("Transaction"), not null
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

describe Transaction do
  it "should require at least two splits" do
    expect {
      Transaction.build do |tr|
        tr.splits.create([
          { amount: 10, account: Account::Paypal.instance }
        ])
      end
    }.not_to change(Split, :count)
  end

  it "should require splits to be balanced" do
    expect {
      Transaction.build do |tr|
        tr.splits.create([
          { amount: 10, item: create(:person) },
          { amount: -9, account: Account::Paypal.instance }
        ])
      end
    }.not_to change(Split, :count)
  end

  it "should be valid with balanced splits" do
    expect {
      Transaction.build do |tr|
        tr.splits.create([
          { amount: 10,   item: create(:person) },
          { amount: -10,  account: Account::Paypal.instance }
        ])
      end
    }.to change(Split, :count).by 2
  end

  context "with transaction" do
    let(:person) { create(:person) }
    let!(:transaction) do
      Transaction.build do |tr|
        tr.splits.create([
          { amount: 10,   item: person },
          { amount: -10,  account: Account::Paypal.instance }
        ])
      end
    end

    it "should have relations with all items/accounts in splits" do
      expect(person.txns).to include transaction
      expect(Account::Paypal.instance.txns).to include transaction
    end

    it "should have an item" do
      expect(transaction.splits.find_by('amount > 0').item).to eq(person)
    end
  end

  describe 'Liability for items' do

    let(:liability_for_item) { -> (item) { Transaction.liability_for_item(item) } }

    describe 'Bounty' do

      let(:bounty) { build_stubbed(:bounty, amount: 100)}

      it 'should calculate amounts' do
        expect(liability_for_item[bounty]).to eq(bounty.amount)
      end

    end

    describe 'Bounty with upsells' do

      let(:bounty) { build_stubbed(:bounty, amount: 100, bounty_expiration: 'never', upon_expiration: 'implode', promotion: 'firing squad')}

      it 'should calculate amounts' do
        expect(liability_for_item[bounty]).to eq(bounty.amount)
      end

    end

    describe 'Pledge' do

      let(:pledge) { build_stubbed(:pledge, amount: 100) }

      it 'should calculate amounts' do
        expect(liability_for_item[pledge]).to eq(pledge.amount)
      end

    end

    describe 'Pledge with merch fee' do

      let(:fundraiser) { build_stubbed(:fundraiser) }
      let(:reward) { build_stubbed(:reward, fundraiser: fundraiser, merchandise_fee: 25) }
      let!(:pledge) { build_stubbed(:pledge, amount: 100, reward: reward) }

      it 'should calculate amounts' do
        expect(liability_for_item[pledge]).to eq(pledge.amount - reward.merchandise_fee)
      end

    end

    describe 'Team Payin' do

      let(:team_payin) { build_stubbed(:team_payin, amount: 100) }

      it 'should calculate amounts' do
        expect(liability_for_item[team_payin]).to eq(team_payin.amount)
      end

    end
  end

  describe 'Gross for items' do

    let(:gross_for_item) { -> (item) { Transaction.gross_for_item(item) } }

    describe 'Bounty' do

      let(:bounty) { build_stubbed(:bounty, amount: 100)}

      it 'should calculate amounts' do
        expect(gross_for_item[bounty]).to eq(bounty.amount)
      end

    end

    describe 'Bounty with upsells' do

      let(:bounty) { build_stubbed(:bounty, amount: 100, bounty_expiration: 'never', upon_expiration: 'implode', promotion: 'firing squad')}

      it 'should calculate amounts' do
        expect(gross_for_item[bounty]).to eq(bounty.amount)
      end

    end

    describe 'Pledge' do

      let(:pledge) { build_stubbed(:pledge, amount: 100) }

      it 'should calculate amounts' do
        expect(gross_for_item[pledge]).to eq(pledge.amount)
      end

    end

    describe 'Pledge with merch fee' do

      let(:fundraiser) { build_stubbed(:fundraiser) }
      let(:reward) { build_stubbed(:reward, fundraiser: fundraiser, merchandise_fee: 25) }
      let!(:pledge) { build_stubbed(:pledge, amount: 100, reward: reward) }

      it 'should calculate amounts' do
        expect(gross_for_item[pledge]).to eq(pledge.amount)
      end

    end

    describe 'Team Payin' do

      let(:team_payin) { build_stubbed(:team_payin, amount: 100) }

      it 'should calculate amounts' do
        expect(gross_for_item[team_payin]).to eq(team_payin.amount)
      end

    end
  end


end
