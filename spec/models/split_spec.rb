# == Schema Information
#
# Table name: splits
#
#  id             :integer          not null, primary key
#  amount         :decimal(10, 2)   not null
#  status         :string(255)      default("approved"), not null
#  account_id     :integer          not null
#  transaction_id :integer          not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  currency       :string(255)      default("USD"), not null
#  item_id        :integer
#  item_type      :string(255)
#  dirty          :integer          default(0), not null
#
# Indexes
#
#  index_splits_on_account_id      (account_id)
#  index_splits_on_transaction_id  (transaction_id)
#

require 'spec_helper'

describe Split do
  let(:transaction) { create(:transaction) }

  describe "are_balanced" do
    let(:account) { Account.new }
    let(:split1) { Split.new amount:  1, account: account }
    let(:split2) { Split.new amount:  2, account: account }
    let(:split3) { Split.new amount:  -3, account: account }
    let(:split4) { Split.new amount:  -4, account: account }

    it "should check for split balance" do
      expect(Split.balanced?([])).to be_truthy
      expect(Split.balanced?([split1, split2, split3])).to be_truthy
      expect(Split.balanced?([split1, split2, split4])).to be_falsey
    end
  end

  describe "account relation" do
    it "should create account for item" do
      expect { Account::Paypal.instance }.to change(Account, :count).by 1

      expect {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20,   item: create(:person) },
            { amount: -20,  account: Account::Paypal.instance }
          ])
        end
      }.to change(Account, :count).by 1
    end

    it "should not create for item that has no account" do
      expect {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20,   item: create(:search) },
            { amount: -20,  account: Account::Paypal.instance }
          ])
        end
      }.not_to change(Account, :count)
    end

    it "should not create invalid splits" do
      expect {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20, },
            { amount: -20 }
          ])
        end
      }.not_to change(Split, :count)
    end

    it "should not create splits if transaction is invalid" do
      expect {
        # unbalanced splits invalidate transaction
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20000,  item: create(:person) },
            { amount: -20,    account: Account::Paypal.instance }
          ])
        end
      }.not_to change(Split, :count)
    end

    it "should create all splits" do
      expect {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20,   item: create(:person) },
            { amount: -20,  account: Account::Paypal.instance }
          ])
        end
      }.to change(Split, :count).by 2
    end

    context "with split" do
      let!(:transaction)  { create(:transaction) }
      let(:split)         { transaction.splits.new amount: 100 }
      let(:account)       { build(:account) }
      let(:person_with_account) {
        p = create(:person)
        p.create_account
        p
      }

      it "should require account or item" do
        expect(split).not_to be_valid
        expect(split.errors).to have_key :account
      end

      it "should require account on item if no account provided" do
        split.item = create(:search)
        expect(split).not_to be_valid
        expect(split.errors).to have_key :account
      end

      it "should have account through item" do
        expect(person_with_account.account).not_to be_nil
        split.item = person_with_account
        expect(split.save).to be_truthy
        expect(split.account).to eq(person_with_account.account)
      end

      it "should accept item without account" do
        split.item    = create(:search)
        split.account = account
        expect(split).to be_valid
        expect(split.account).to eq(account)
      end

      it "should use account with both account and item provided" do
        split.account = account
        expect(split.account).to eq(account)
      end
    end
  end

  it "should not create a zero split" do
    split = build(:split, amount: 0)
    expect(split).not_to be_valid
    expect(split.errors).to include :amount
  end
end
