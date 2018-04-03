require 'spec_helper'

# these are some tests for the create_bounty and create_pledge helper methods
# defined in specs/support/payment_helpers.rb
describe "payment helpers" do

  describe "bounties" do
    let!(:issue)  { create(:issue) }
    let!(:backer) { create(:person_with_money_in_account, money_amount: 100) }

    it "should create with no extra arguments" do
      expect {
       create_bounty 10
      }.to change(Bounty, :count).by 1
    end

    it "should create with an issue and a person" do
      expect {
        create_bounty(100, person: backer, issue: issue)
      }.to change(Bounty, :count).by 1
    end

    it "should include associate bounty with issue if provided" do
      expect {
        create_bounty(100, issue: issue)
      }.to change(issue.bounties, :count).by 1
    end

    it "should associate bounty with person if provided" do
      expect {
        create_bounty(100, person: backer)
      }.to change(backer.bounties, :count).by 1
    end

    it "should add bountysource fee to total" do
      expect {
        create_bounty 100, issue: issue
      }.to change(Account::Paypal.instance, :balance).by -(100 + (100 * Api::Application.config.bountysource_tax))
    end

    it "should collect bountysource fee" do
      expect {
        create_bounty 100, issue: issue
      }.to change(Account::BountySourceFeesBounty.instance, :balance).by (100 * Api::Application.config.bountysource_tax)
    end

    it "should add listed amount to issue account" do
      expect {
        create_bounty 100, issue: issue
        issue.reload
      }.to change(issue, :account_balance).by 100
    end

    it "should create a transaction" do
      expect {
        create_bounty(100, person: backer)
      }.to change(Transaction, :count).by 1
    end

    it "should associate transaction with bounty" do
      bounty = create_bounty(100, person: backer)
      expect(bounty.txns.last).to eq(Transaction.last)
      expect(bounty.txns.last.splits.count).to eq(3)
    end

    it "should add extra attributes to bounty if provided" do
      bounty = create_bounty(100, status: 'in_dispute')
      expect(bounty.status).to match /in_dispute/i
    end
  end

end
