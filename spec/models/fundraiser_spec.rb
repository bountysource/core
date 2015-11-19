# == Schema Information
#
# Table name: fundraisers
#
#  id                :integer          not null, primary key
#  person_id         :integer          not null
#  published         :boolean          default(FALSE), not null
#  title             :string(255)
#  homepage_url      :string(255)
#  repo_url          :string(255)
#  description       :text
#  about_me          :text
#  funding_goal      :integer          default(100)
#  published_at      :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  total_pledged     :decimal(10, 2)   default(0.0), not null
#  featured          :boolean          default(FALSE), not null
#  short_description :string(255)
#  days_open         :integer          default(30)
#  ends_at           :datetime
#  breached_at       :datetime
#  completed         :boolean          default(FALSE), not null
#  breached          :boolean          default(FALSE), not null
#  featured_at       :boolean
#  hidden            :boolean          default(FALSE), not null
#  cloudinary_id     :string(255)
#  team_id           :integer
#  tracker_id        :integer
#
# Indexes
#
#  index_fundraisers_on_breached     (breached)
#  index_fundraisers_on_completed    (completed)
#  index_fundraisers_on_ends_at      (ends_at)
#  index_fundraisers_on_featured     (featured)
#  index_fundraisers_on_featured_at  (featured_at)
#  index_fundraisers_on_hidden       (hidden)
#  index_fundraisers_on_person_id    (person_id)
#  index_fundraisers_on_published    (published)
#

require 'spec_helper'

describe Fundraiser do
  let!(:person) { create(:person) }
  let(:team) { create(:team) }

  describe "account" do
    let!(:fundraiser) { create(:fundraiser) }
    let!(:backer) { create(:person_with_money_in_account, money_amount: 100) }

    it "should not have account after create" do
      lambda {
        create(:fundraiser)
      }.should_not change(Account, :count)
    end

    it "should not lazy load account" do
      lambda {
        fundraiser.account
      }.should_not change(Account, :count)
    end

    it "should create account on transaction create" do
      fundraiser.account.should be_nil

      pledge = create(:pledge, fundraiser: fundraiser)

      Transaction.build do |tr|
        tr.splits.create([
          { amount: -10,  account: Account::Paypal.instance },
          { amount: 10,   item: pledge }
        ])
      end

      fundraiser.reload.account.should_not be_nil
    end

    describe "with account" do
      let!(:pledge) do
        create_pledge(100, fundraiser: fundraiser, backer: backer)
      end

      it "should establish relationship to account" do
        fundraiser.account.should_not be_nil
        fundraiser.account.should be_an Account::Fundraiser
      end
    end
  end

  describe "frontend URLs" do
    let(:fundraiser) { create(:fundraiser, person: person, title: 'This is my awesome fundraiser') }
    let(:pledge) { create(:pledge, fundraiser: fundraiser, amount: 10, person: person) }

    it "should return a frontend URL" do
      fundraiser.frontend_path.should == "/teams/#{fundraiser.team.slug}/fundraiser"
    end

    it "should revert to old paths for fundraisers without teams" do
      fundraiser.stub(team: nil)
      fundraiser.frontend_path.should == "/fundraisers/#{fundraiser.to_param}"
    end

    it "should return a url that is safe for multiple word team names" do
      fundraiser.team.stub(:name) { 'Four word team name' }
      fundraiser.frontend_path.should == "/teams/#{fundraiser.team.slug}/fundraiser"
    end

    it "should return frontend edit URL if owner" do
      fundraiser.frontend_edit_path.should == "fundraisers/#{fundraiser.to_param}/edit"
    end
  end

  it "should not run validations if publish == false (default)" do
    lambda {
      fundraiser = person.fundraisers.create!(title: 'My OSS Project', team: team)
      fundraiser.published?.should be_falsey
      fundraiser.valid?.should be_truthy
    }.should_not raise_exception
  end

  it "should create with no data, except for title and team (both are required to create now)" do
    lambda { person.fundraisers.create!(title: 'My Awesome Project', team: team) }.should_not raise_exception
  end

  it "should run validations when publishing" do
    fundraiser = person.fundraisers.create!(title: "My OSS Project", team: team)
    fundraiser.published = true
    fundraiser.valid?.should be_falsey
  end

  it "should publish successfully" do
    fundraiser = person.fundraisers.create!(
      title:              "My OSS Project",
      short_description:  "Best project ever!",
      description:        "This is great and you need it right now. Give me your money.",
      about_me:           "My source code brings all the boys to the repository.",
      funding_goal:       10000000,
      days_open:          Fundraiser.min_days_open,
      team:               team
    )
    fundraiser.publish!.should be_truthy
    fundraiser.valid?.should be_truthy
  end

  it "should not allow more than one published fundraiser" do
    original_fundraiser  = create(:published_fundraiser, team: team)
    person = original_fundraiser.person
    new_fundraiser = person.fundraisers.create!(
      title:              "My OSS Project",
      short_description:  "Best project ever!",
      description:        "This is great and you need it right now. Give me your money.",
      about_me:           "My source code brings all the boys to the repository.",
      funding_goal:       10000000,
      days_open:          Fundraiser.min_days_open,
      team:               team
    )
    new_fundraiser.valid?.should be_truthy
    new_fundraiser.publish!.should be_falsey
    person.fundraisers.in_progress.count.should eq(1)
  end

  it "should fail to publish incomplete fundraiser" do
    fundraiser = person.fundraisers.create!(
      title:          "My OSS Project",
      description:    "This is great and you need it right now. Give me your money.",
      team:           team
    )
    fundraiser.publish!.should_not be_truthy

    fundraiser.reload
    fundraiser.published?.should be_falsey
  end

  it "should raise error when trying to update a published fundraiser" do
    fundraiser = person.fundraisers.create!(
      title:              "My OSS Project",
      short_description:  "Best project ever!",
      description:        "This is great and you need it right now. Give me your money.",
      about_me:           "My source code brings all the boys to the repository.",
      funding_goal:       10000000,
      days_open:          Fundraiser.min_days_open,
      team:               team
    )
    fundraiser.publish!.should be_truthy

    fundraiser.update_attributes(funding_goal: 2300432).should be_falsey
  end

  describe "days open validations" do
    let(:fundraiser) { create(:fundraiser) }

    it "should not be valid with less than min date" do
      fundraiser.days_open = 1
      fundraiser.valid?.should be_falsey
      fundraiser.errors.should include :days_open
    end

    it "should not be valid with greater than max date" do
      fundraiser.days_open = 133337
      fundraiser.valid?.should be_falsey
      fundraiser.errors.should include :days_open
    end

    it "should be valid at exactly min date" do
      fundraiser.days_open = Fundraiser.min_days_open
      fundraiser.should be_valid
    end

    it "should be valid at max date" do
      fundraiser.days_open = Fundraiser.max_days_open
      fundraiser.valid?.should be_truthy
    end

    it "should correctly calculate the number of days remaining if not published" do
      # TODO This test is failing at certain times
      fundraiser.days_open = Fundraiser.min_days_open

      # before, days remaining should just be whatever it was set to
      fundraiser.days_remaining.should == Fundraiser.min_days_open
    end

    describe "published" do
      let!(:fundraiser) { create(:published_fundraiser) }

      it "should calculate days remaining" do
        fundraiser.should be_published
        fundraiser.ends_at.should == fundraiser.published_at.end_of_day.utc + fundraiser.days_open.days
      end
    end
  end

  describe "pledges" do
    let!(:person) { create(:person_with_money_in_account, money_amount: 100) }

    it "should transfer money from person to fundraiser (Transaction+1)" do
      lambda {
        create_pledge 100, person: person, personal: true
      }.should change(Transaction, :count).by 1
    end

    it "should transfer money from paypal to fundraiser (Split+1)" do
      lambda {
        create_pledge 100, person: person, personal: true
      }.should change(Split, :count).by 2
    end

    it "should transfer money from person to fundraiser (Pledge+1)" do
      lambda {
        create_pledge 100, person: person, personal: true
      }.should change(Pledge, :count).by 1
    end
  end

  describe "ends_at" do
    let(:fundraiser) { create(:fundraiser, total_pledged: 100, funding_goal: 101) }

    it "should initialize the ends_at date when published" do
      fundraiser.ends_at.should be_nil
      fundraiser.publish!
      fundraiser.ends_at.should_not be_nil
    end
  end

  describe "funding goal reached?" do
    let(:fundraiser) { create(:published_fundraiser) }

    it "should return true if funding goal == total pledged" do
      fundraiser.total_pledged = 100
      fundraiser.funding_goal = 100
      fundraiser.should be_funded
    end

    it "should return true if funding goal > total pledged" do
      fundraiser.total_pledged = 1000
      fundraiser.funding_goal = 100
      fundraiser.should be_funded
    end

    it "should return false if funding goal < total pledged" do
      fundraiser.total_pledged = 10
      fundraiser.funding_goal = 100
      fundraiser.should_not be_funded
    end

    it "should return true if half way funded" do
      fundraiser.total_pledged = 50
      fundraiser.funding_goal = 100
      fundraiser.funded?(0.50).should be_truthy
    end
  end

  describe "featuring a fundraiser" do
    let(:fundraiser) { create(:fundraiser, person: person, featured: false) }

    it "should send a notification email to creator" do
      fundraiser.person.stub(:send_email).with(:fundraiser_featured_notification, fundraiser: fundraiser).once
      fundraiser.feature!
    end

    it "should not send email" do
      fundraiser.person.stub(:send_email).with(:fundraiser_featured_notification, fundraiser: fundraiser).never
      fundraiser.unfeature!
    end
  end

  describe "zero_amount reward representing 'No Reward'" do
    let(:fundraiser) { create(:fundraiser) }

    it "should create a zero reward with fundraiser" do
      fundraiser.zero_reward.should_not be_nil
    end

    it "should not be able to delete zero_reward" do
      lambda {
        fundraiser.zero_reward.destroy
      }.should_not change(fundraiser.rewards, :count)
    end

    it "should not be able to change zero reward" do
      lambda {
        fundraiser.zero_reward.update_attributes amount: 1337
      }.should_not change(fundraiser.zero_reward, :amount)
    end
  end

  describe "payout" do
    let(:backer)             { create(:person_with_money_in_account, money_amount: 1200) }
    let(:fundraiser)         { create(:published_fundraiser, funding_goal: 1200) }
    let(:reward)             { create(:reward, fundraiser: fundraiser) }
    let(:reward_with_merch)  { create(:reward, fundraiser: fundraiser, merchandise_fee: 10.50) }

    let!(:pledge1) { create_pledge 400, person: backer, fundraiser: fundraiser, personal: true }
    let!(:pledge2) { create_pledge 400, person: backer, fundraiser: fundraiser, reward: reward, personal: true }
    let!(:pledge3) { create_pledge 400, person: backer, fundraiser: fundraiser, reward: reward_with_merch, personal: true }

    context "transaction rolls back" do
      before { Transaction.stub(:build) { nil } }

      it "should not payout pledge1" do
        lambda {
          fundraiser.payout!
        }.should_not change(pledge1, :status)
      end

      it "should not payout pledge2" do
        lambda {
          fundraiser.payout!
        }.should_not change(pledge2, :status)
      end

      it "should not payout pledge3" do
        lambda {
          fundraiser.payout!
        }.should_not change(pledge3, :status)
      end

      it "should not create transaction" do
        lambda {
          fundraiser.payout!
        }.should_not change(Transaction, :count)
      end
    end

    it "should not have merch fees in pay out" do
      expect {
        fundraiser.payout!
      }.to_not change(Account::BountySourceMerch.instance, :balance)
    end

    it "it should move entire fundraiser account balance to owner's account" do
      account_balance = fundraiser.account_balance
      expect {
        fundraiser.payout!
      }.to change(person, :account_balance).by account_balance
    end

    context "after payout" do
      before { fundraiser.payout! }

      it "should not create transaction if account balance is zero" do
        # make sure all of dat money is gone
        fundraiser.account_balance.should == 0

        lambda {
          fundraiser.payout!
        }.should_not change(Transaction, :count)
      end

      it "should be idempotent, if no more pledges created since last payout" do
        lambda { fundraiser.payout! }.should_not change(Transaction, :count)
        lambda { fundraiser.payout! }.should_not change(Split, :count)
        lambda { fundraiser.payout! }.should_not change(fundraiser, :account_balance)
        lambda { fundraiser.payout! }.should_not change(fundraiser.person, :account_balance)
        lambda { fundraiser.payout! }.should_not change(Account::BountySourceFeesPledge.instance, :balance)
        lambda { fundraiser.payout! }.should_not change(Account::BountySourceFeesPayment.instance, :balance)
        lambda { fundraiser.payout! }.should_not change(Account::BountySourceMerch.instance, :balance)
      end

      it "should create another transaction if paid out, a pledge is made, then paid out again" do
        create_pledge 400, fundraiser: fundraiser, personal: true
        fundraiser.reload

        lambda {
          fundraiser.payout!
          fundraiser.reload
        }.should change(fundraiser.person, :account_balance).by (400)
      end

      #it "should only charge for merch rewards once" do
      #  # make sure it paid out all of the rewards
      #  fundraiser.pledges.each { |pledge| pledge.should be_paid }
      #
      #  # new backer comes in and claims a merch reward
      #  3.times { create_pledge 400, fundraiser: fundraiser, reward: reward_with_merch }
      #
      #  # only the merchandise fee for that new pledge should go into the merch fees account
      #  lambda {
      #    fundraiser.payout!
      #    fundraiser.reload
      #  }.should change(Account::BountySourceMerch.instance, :balance).by reward_with_merch.merchandise_fee * 3
      #end

      it "should not include $0 splits if no merch" do
        # create pledge, selecting a reward with no merch
        create_pledge 100, reward: reward, fundraiser: fundraiser

        lambda {
          fundraiser.payout!
        }.should change(Split, :count).by 2

        transaction = Transaction.last
        transaction.splits.pluck(:amount).min.should_not be_zero
      end

      it "should create the correct splits" do
        # create pledge, selecting a reward with no merch
        create_pledge 100, reward: reward_with_merch, fundraiser: fundraiser

        # remember the account balance before payout
        amount = fundraiser.account_balance

        lambda {
          fundraiser.payout!
        }.should change(Split, :count).by 2

        transaction = Transaction.last

        # split subtracting fundraiser balance
        transaction.splits.select { |s| s.amount == -amount }.should be_present

        # split giving funds to person
        transaction.splits.select { |s| s.amount == amount }.should be_present
      end
    end
  end

  describe "payout on goal breaches" do
    let!(:fundraiser) { create(:published_fundraiser, funding_goal: 1000, total_pledged: 0) }

    it "should create payout transaction" do
      lambda {
        create_pledge 1000, fundraiser: fundraiser
      }.should change(fundraiser.transactions, :count).by 2
    end

    it "should receive check_for_breach message after pledge creation" do
      create_pledge 100, fundraiser: fundraiser
      fundraiser.stub(:check_for_breach).once
    end

    context "50% of goal breached" do
      it "should email creator" do
        fundraiser.person.stub(:send_email).with(:notify_creator_of_fundraiser_half_completion, fundraiser: fundraiser).once

        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
      end

      it "should email backers" do
        fundraiser.backers.each do |backer|
          backer.stub(:send_email).with(:notify_backers_of_fundraiser_half_completion, fundraiser: fundraiser).once
        end

        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
      end

      it "should not payout" do
        fundraiser.stub(:payout!).never

        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
      end

      it "should not be breached" do
        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
        fundraiser.should_not be_breached
      end
    end

    context "100% of goal reached" do
      before do
        create_pledge 900, fundraiser: fundraiser, personal: true
      end

      it "should have $900 in account" do
        fundraiser.account_balance.should == 900
      end

      it "should payout $1200 if another $300 pledge is made" do
        create_pledge 300, fundraiser: fundraiser, personal: true
        fundraiser.should be_breached

        # the payout transaction should have splits for $1200
        txn = Transaction.last
        split_items = txn.splits.map(&:item)
        split_items.should include fundraiser.person
        split_items.should include fundraiser
        txn.splits.first.amount.abs.should == 1200
      end

      it "should email creator" do
        fundraiser.person.stub(:send_email).with(:notify_creator_of_fundraiser_breached, fundraiser: fundraiser).once
        create_pledge 300, fundraiser: fundraiser
      end

      it "should email backers" do
        fundraiser.backers.find_each do |backer|
          backer.stub(:send_email).with(:notify_backers_of_fundraiser_breached, fundraiser: fundraiser).once
        end

        create_pledge 300, fundraiser: fundraiser
      end
    end
  end

  describe "refund backers" do
    let!(:fundraiser) { create(:published_fundraiser) }
    let!(:pledge1) { create_pledge 100, fundraiser: fundraiser }
    let!(:pledge2) { create_pledge 100, fundraiser: fundraiser }

    it "should refund" do
      lambda {
        fundraiser.refund_backers!
      }.should change(Transaction, :count).by 1
    end

    it "should have correct fundraiser account balance" do
      fundraiser.account_balance.should be == 180
    end

    it "should get the splits right" do
      account_balance_before = fundraiser.account_balance

      fundraiser.refund_backers!

      transaction = Transaction.last

      # split removing all money from fundraiser
      transaction.splits.select { |s| s.amount == -account_balance_before && s.item == fundraiser }.should be_present

      # split giving money back to person1
      transaction.splits.select { |s| s.amount == +90 && s.item == pledge1.person }.should be_present

      # split giving money back to person2
      transaction.splits.select { |s| s.amount == +90 && s.item == pledge2.person }.should be_present
    end
  end

end
