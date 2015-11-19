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
      Split.balanced?([]).should be_truthy
      Split.balanced?([split1, split2, split3]).should be_truthy
      Split.balanced?([split1, split2, split4]).should be_falsey
    end
  end

  describe "account relation" do
    it "should create account for item" do
      lambda { Account::Paypal.instance }.should change(Account, :count).by 1

      lambda {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20,   item: create(:person) },
            { amount: -20,  account: Account::Paypal.instance }
          ])
        end
      }.should change(Account, :count).by 1
    end

    it "should not create for item that has no account" do
      lambda {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20,   item: create(:search) },
            { amount: -20,  account: Account::Paypal.instance }
          ])
        end
      }.should_not change(Account, :count)
    end

    it "should not create invalid splits" do
      lambda {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20, },
            { amount: -20 }
          ])
        end
      }.should_not change(Split, :count)
    end

    it "should not create splits if transaction is invalid" do
      lambda {
        # unbalanced splits invalidate transaction
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20000,  item: create(:person) },
            { amount: -20,    account: Account::Paypal.instance }
          ])
        end
      }.should_not change(Split, :count)
    end

    it "should create all splits" do
      lambda {
        Transaction.build do |tr|
          tr.splits.create([
            { amount: 20,   item: create(:person) },
            { amount: -20,  account: Account::Paypal.instance }
          ])
        end
      }.should change(Split, :count).by 2
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
        split.should_not be_valid
        split.errors.should have_key :account
      end

      it "should require account on item if no account provided" do
        split.item = create(:search)
        split.should_not be_valid
        split.errors.should have_key :account
      end

      it "should have account through item" do
        person_with_account.account.should_not be_nil
        split.item = person_with_account
        split.save.should be_truthy
        split.account.should == person_with_account.account
      end

      it "should accept item without account" do
        split.item    = create(:search)
        split.account = account
        split.should be_valid
        split.account.should == account
      end

      it "should use account with both account and item provided" do
        split.account = account
        split.account.should == account
      end
    end
  end

  it "should not create a zero split" do
    split = build(:split, amount: 0)
    split.should_not be_valid
    split.errors.should include :amount
  end
end
