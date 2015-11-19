require 'spec_helper'

# these are some tests for the create_bounty and create_pledge helper methods
# defined in specs/support/payment_helpers.rb
describe "payment helpers" do

  describe "bounties" do
    let!(:issue)  { create(:issue) }
    let!(:backer) { create(:person_with_money_in_account, money_amount: 100) }

    it "should create with no extra arguments" do
      lambda {
       create_bounty 10
      }.should change(Bounty, :count).by 1
    end

    it "should create with an issue and a person" do
      lambda {
        create_bounty(100, person: backer, issue: issue)
      }.should change(Bounty, :count).by 1
    end

    it "should include associate bounty with issue if provided" do
      lambda {
        create_bounty(100, issue: issue)
      }.should change(issue.bounties, :count).by 1
    end

    it "should associate bounty with person if provided" do
      lambda {
        create_bounty(100, person: backer)
      }.should change(backer.bounties, :count).by 1
    end

    it "should add bountysource fee to total" do
      lambda {
        create_bounty 100, issue: issue
      }.should change(Account::Paypal.instance, :balance).by -(100 + (100 * Api::Application.config.bountysource_tax))
    end

    it "should collect bountysource fee" do
      lambda {
        create_bounty 100, issue: issue
      }.should change(Account::BountySourceFeesBounty.instance, :balance).by (100 * Api::Application.config.bountysource_tax)
    end

    it "should add listed amount to issue account" do
      lambda {
        create_bounty 100, issue: issue
        issue.reload
      }.should change(issue, :account_balance).by 100
    end

    it "should create a transaction" do
      lambda {
        create_bounty(100, person: backer)
      }.should change(Transaction, :count).by 1
    end

    it "should associate transaction with bounty" do
      bounty = create_bounty(100, person: backer)
      bounty.transactions.last.should == Transaction.last
      bounty.transactions.last.splits.count.should == 3
    end

    it "should add extra attributes to bounty if provided" do
      bounty = create_bounty(100, status: 'in_dispute')
      bounty.status.should match /in_dispute/i
    end
  end

end