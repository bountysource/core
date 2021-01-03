# == Schema Information
#
# Table name: fundraisers
#
#  id                :integer          not null, primary key
#  person_id         :integer          not null
#  published         :boolean          default(FALSE), not null
#  title             :string
#  homepage_url      :string
#  repo_url          :string
#  description       :text
#  about_me          :text
#  funding_goal      :bigint(8)        default(100)
#  published_at      :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  total_pledged     :decimal(10, 2)   default(0.0), not null
#  featured          :boolean          default(FALSE), not null
#  short_description :string
#  days_open         :integer          default(30)
#  ends_at           :datetime
#  breached_at       :datetime
#  completed         :boolean          default(FALSE), not null
#  breached          :boolean          default(FALSE), not null
#  featured_at       :boolean
#  hidden            :boolean          default(FALSE), not null
#  cloudinary_id     :string
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
      expect {
        create(:fundraiser)
      }.not_to change(Account, :count)
    end

    it "should not lazy load account" do
      expect {
        fundraiser.account
      }.not_to change(Account, :count)
    end

    it "should create account on transaction create" do
      expect(fundraiser.account).to be_nil

      pledge = create(:pledge, fundraiser: fundraiser)

      Transaction.build do |tr|
        tr.splits.create([
          { amount: -10,  account: Account::Paypal.instance },
          { amount: 10,   item: pledge }
        ])
      end

      expect(fundraiser.reload.account).not_to be_nil
    end

    describe "with account" do
      let!(:pledge) do
        create_pledge(100, fundraiser: fundraiser, backer: backer)
      end

      it "should establish relationship to account" do
        expect(fundraiser.account).not_to be_nil
        expect(fundraiser.account).to be_an Account::Fundraiser
      end
    end
  end

  describe "frontend URLs" do
    let(:fundraiser) { create(:fundraiser, person: person, title: 'This is my awesome fundraiser') }
    let(:pledge) { create(:pledge, fundraiser: fundraiser, amount: 10, person: person) }

    it "should return a frontend URL" do
      expect(fundraiser.frontend_path).to eq("/teams/#{fundraiser.team.slug}/fundraiser")
    end

    it "should revert to old paths for fundraisers without teams" do
      allow(fundraiser).to receive_messages(team: nil)
      expect(fundraiser.frontend_path).to eq("/fundraisers/#{fundraiser.to_param}")
    end

    it "should return a url that is safe for multiple word team names" do
      allow(fundraiser.team).to receive(:name) { 'Four word team name' }
      expect(fundraiser.frontend_path).to eq("/teams/#{fundraiser.team.slug}/fundraiser")
    end

    it "should return frontend edit URL if owner" do
      expect(fundraiser.frontend_edit_path).to eq("fundraisers/#{fundraiser.to_param}/edit")
    end
  end

  it "should not run validations if publish == false (default)" do
    expect {
      fundraiser = person.fundraisers.create!(title: 'My OSS Project', team: team)
      expect(fundraiser.published?).to be_falsey
      expect(fundraiser.valid?).to be_truthy
    }.not_to raise_exception
  end

  it "should create with no data, except for title and team (both are required to create now)" do
    expect { person.fundraisers.create!(title: 'My Awesome Project', team: team) }.not_to raise_exception
  end

  it "should run validations when publishing" do
    fundraiser = person.fundraisers.create!(title: "My OSS Project", team: team)
    fundraiser.published = true
    expect(fundraiser.valid?).to be_falsey
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
    expect(fundraiser.publish!).to be_truthy
    expect(fundraiser.valid?).to be_truthy
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
    expect(new_fundraiser.valid?).to be_truthy
    expect(new_fundraiser.publish!).to be_falsey
    expect(person.fundraisers.in_progress.count).to eq(1)
  end

  it "should fail to publish incomplete fundraiser" do
    fundraiser = person.fundraisers.create!(
      title:          "My OSS Project",
      description:    "This is great and you need it right now. Give me your money.",
      team:           team
    )
    expect(fundraiser.publish!).not_to be_truthy

    fundraiser.reload
    expect(fundraiser.published?).to be_falsey
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
    expect(fundraiser.publish!).to be_truthy

    expect(fundraiser.update_attributes(funding_goal: 2300432)).to be_falsey
  end

  describe "days open validations" do
    let(:fundraiser) { create(:fundraiser) }

    it "should not be valid with less than min date" do
      fundraiser.days_open = 1
      expect(fundraiser.valid?).to be_falsey
      expect(fundraiser.errors).to include :days_open
    end

    it "should not be valid with greater than max date" do
      fundraiser.days_open = 133337
      expect(fundraiser.valid?).to be_falsey
      expect(fundraiser.errors).to include :days_open
    end

    it "should be valid at exactly min date" do
      fundraiser.days_open = Fundraiser.min_days_open
      expect(fundraiser).to be_valid
    end

    it "should be valid at max date" do
      fundraiser.days_open = Fundraiser.max_days_open
      expect(fundraiser.valid?).to be_truthy
    end

    it "should correctly calculate the number of days remaining if not published" do
      # TODO This test is failing at certain times
      fundraiser.days_open = Fundraiser.min_days_open

      # before, days remaining should just be whatever it was set to
      expect(fundraiser.days_remaining).to eq(Fundraiser.min_days_open)
    end

    describe "published" do
      let!(:fundraiser) { create(:published_fundraiser) }

      it "should calculate days remaining" do
        expect(fundraiser).to be_published
        expect(fundraiser.ends_at).to eq(fundraiser.published_at.end_of_day.utc + fundraiser.days_open.days)
      end
    end
  end

  describe "pledges" do
    let!(:person) { create(:person_with_money_in_account, money_amount: 100) }

    it "should transfer money from person to fundraiser (Transaction+1)" do
      expect {
        create_pledge 100, person: person, personal: true
      }.to change(Transaction, :count).by 1
    end

    it "should transfer money from paypal to fundraiser (Split+1)" do
      expect {
        create_pledge 100, person: person, personal: true
      }.to change(Split, :count).by 2
    end

    it "should transfer money from person to fundraiser (Pledge+1)" do
      expect {
        create_pledge 100, person: person, personal: true
      }.to change(Pledge, :count).by 1
    end
  end

  describe "ends_at" do
    let(:fundraiser) { create(:fundraiser, total_pledged: 100, funding_goal: 101) }

    it "should initialize the ends_at date when published" do
      expect(fundraiser.ends_at).to be_nil
      fundraiser.publish!
      expect(fundraiser.ends_at).not_to be_nil
    end
  end

  describe "funding goal reached?" do
    let(:fundraiser) { create(:published_fundraiser) }

    it "should return true if funding goal == total pledged" do
      fundraiser.total_pledged = 100
      fundraiser.funding_goal = 100
      expect(fundraiser).to be_funded
    end

    it "should return true if funding goal > total pledged" do
      fundraiser.total_pledged = 1000
      fundraiser.funding_goal = 100
      expect(fundraiser).to be_funded
    end

    it "should return false if funding goal < total pledged" do
      fundraiser.total_pledged = 10
      fundraiser.funding_goal = 100
      expect(fundraiser).not_to be_funded
    end

    it "should return true if half way funded" do
      fundraiser.total_pledged = 50
      fundraiser.funding_goal = 100
      expect(fundraiser.funded?(0.50)).to be_truthy
    end
  end

  describe "featuring a fundraiser" do
    let(:fundraiser) { create(:fundraiser, person: person, featured: false) }

    it "should send a notification email to creator" do
      allow(fundraiser.person).to receive(:send_email).with(:fundraiser_featured_notification, fundraiser: fundraiser).once
      fundraiser.feature!
    end

    it "should not send email" do
      allow(fundraiser.person).to receive(:send_email).with(:fundraiser_featured_notification, fundraiser: fundraiser).never
      fundraiser.unfeature!
    end
  end

  describe "zero_amount reward representing 'No Reward'" do
    let(:fundraiser) { create(:fundraiser) }

    it "should create a zero reward with fundraiser" do
      expect(fundraiser.zero_reward).not_to be_nil
    end

    it "should not be able to delete zero_reward" do
      expect {
        fundraiser.zero_reward.destroy
      }.not_to change(fundraiser.rewards, :count)
    end

    it "should not be able to change zero reward" do
      expect {
        fundraiser.zero_reward.update_attributes amount: 1337
      }.not_to change(fundraiser.zero_reward, :amount)
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
      before { allow(Transaction).to receive(:build) { nil } }

      it "should not payout pledge1" do
        expect {
          fundraiser.payout!
        }.not_to change(pledge1, :status)
      end

      it "should not payout pledge2" do
        expect {
          fundraiser.payout!
        }.not_to change(pledge2, :status)
      end

      it "should not payout pledge3" do
        expect {
          fundraiser.payout!
        }.not_to change(pledge3, :status)
      end

      it "should not create transaction" do
        expect {
          fundraiser.payout!
        }.not_to change(Transaction, :count)
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
        expect(fundraiser.account_balance).to eq(0)

        expect {
          fundraiser.payout!
        }.not_to change(Transaction, :count)
      end

      it "should be idempotent, if no more pledges created since last payout" do
        expect { fundraiser.payout! }.not_to change(Transaction, :count)
        expect { fundraiser.payout! }.not_to change(Split, :count)
        expect { fundraiser.payout! }.not_to change(fundraiser, :account_balance)
        expect { fundraiser.payout! }.not_to change(fundraiser.person, :account_balance)
        expect { fundraiser.payout! }.not_to change(Account::BountySourceFeesPledge.instance, :balance)
        expect { fundraiser.payout! }.not_to change(Account::BountySourceFeesPayment.instance, :balance)
        expect { fundraiser.payout! }.not_to change(Account::BountySourceMerch.instance, :balance)
      end

      it "should create another transaction if paid out, a pledge is made, then paid out again" do
        create_pledge 400, fundraiser: fundraiser, personal: true
        fundraiser.reload

        expect {
          fundraiser.payout!
          fundraiser.reload
        }.to change(fundraiser.person, :account_balance).by (400)
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

        expect {
          fundraiser.payout!
        }.to change(Split, :count).by 2

        transaction = Transaction.last
        expect(transaction.splits.pluck(:amount).min).not_to be_zero
      end

      it "should create the correct splits" do
        # create pledge, selecting a reward with no merch
        create_pledge 100, reward: reward_with_merch, fundraiser: fundraiser

        # remember the account balance before payout
        amount = fundraiser.account_balance

        expect {
          fundraiser.payout!
        }.to change(Split, :count).by 2

        transaction = Transaction.last

        # split subtracting fundraiser balance
        expect(transaction.splits.select { |s| s.amount == -amount }).to be_present

        # split giving funds to person
        expect(transaction.splits.select { |s| s.amount == amount }).to be_present
      end
    end
  end

  describe "payout on goal breaches" do
    let!(:fundraiser) { create(:published_fundraiser, funding_goal: 1000, total_pledged: 0) }

    it "should create payout transaction" do
      expect {
        create_pledge 1000, fundraiser: fundraiser
      }.to change(fundraiser.txns, :count).by 2
    end

    it "should receive check_for_breach message after pledge creation" do
      create_pledge 100, fundraiser: fundraiser
      allow(fundraiser).to receive(:check_for_breach).once
    end

    context "50% of goal breached" do
      it "should email creator" do
        allow(fundraiser.person).to receive(:send_email).with(:notify_creator_of_fundraiser_half_completion, fundraiser: fundraiser).once

        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
      end

      it "should email backers" do
        fundraiser.backers.each do |backer|
          allow(backer).to receive(:send_email).with(:notify_backers_of_fundraiser_half_completion, fundraiser: fundraiser).once
        end

        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
      end

      it "should not payout" do
        allow(fundraiser).to receive(:payout!).never

        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
      end

      it "should not be breached" do
        create_pledge (fundraiser.funding_goal / 2), fundraiser: fundraiser
        expect(fundraiser).not_to be_breached
      end
    end

    context "100% of goal reached" do
      before do
        create_pledge 900, fundraiser: fundraiser, personal: true
      end

      it "should have $900 in account" do
        expect(fundraiser.account_balance).to eq(900)
      end

      it "should payout $1200 if another $300 pledge is made" do
        create_pledge 300, fundraiser: fundraiser, personal: true
        expect(fundraiser).to be_breached

        # the payout transaction should have splits for $1200
        txn = Transaction.last
        split_items = txn.splits.map(&:item)
        expect(split_items).to include fundraiser.person
        expect(split_items).to include fundraiser
        expect(txn.splits.first.amount.abs).to eq(1200)
      end

      it "should email creator" do
        allow(fundraiser.person).to receive(:send_email).with(:notify_creator_of_fundraiser_breached, fundraiser: fundraiser).once
        create_pledge 300, fundraiser: fundraiser
      end

      it "should email backers" do
        fundraiser.backers.find_each do |backer|
          allow(backer).to receive(:send_email).with(:notify_backers_of_fundraiser_breached, fundraiser: fundraiser).once
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
      expect {
        fundraiser.refund_backers!
      }.to change(Transaction, :count).by 1
    end

    it "should have correct fundraiser account balance" do
      expect(fundraiser.account_balance).to eq(180)
    end

    it "should get the splits right" do
      account_balance_before = fundraiser.account_balance

      fundraiser.refund_backers!

      transaction = Transaction.last

      # split removing all money from fundraiser
      expect(transaction.splits.select { |s| s.amount == -account_balance_before && s.item == fundraiser }).to be_present

      # split giving money back to person1
      expect(transaction.splits.select { |s| s.amount == +90 && s.item == pledge1.person }).to be_present

      # split giving money back to person2
      expect(transaction.splits.select { |s| s.amount == +90 && s.item == pledge2.person }).to be_present
    end
  end

end
