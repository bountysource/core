# == Schema Information
#
# Table name: pledges
#
#  id              :integer          not null, primary key
#  fundraiser_id   :integer
#  person_id       :integer
#  amount          :decimal(10, 2)   not null
#  status          :string(12)       default("active")
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  reward_id       :integer
#  survey_response :text
#  anonymous       :boolean          default(FALSE), not null
#  owner_type      :string
#  owner_id        :integer
#
# Indexes
#
#  index_pledges_on_anonymous   (anonymous)
#  index_pledges_on_owner_id    (owner_id)
#  index_pledges_on_owner_type  (owner_type)
#  index_pledges_on_status      (status)
#

require 'spec_helper'

describe Pledge do
  let!(:person) { create(:person) }
  let!(:fundraiser) { create(:published_fundraiser, funding_goal: 100) }
  let(:reward) { create(:reward, amount: 10, description: "I will buy you some beer", fundraiser: fundraiser, fulfillment_details: "I need ur digits gurl") }
  let(:pledge1) { create(:pledge, person: person, amount: '13.37', reward: reward, fundraiser: fundraiser) }
  let(:pledge2) { create(:pledge, person: person, amount: '13.37', reward: reward, fundraiser: fundraiser) }

  it "should mail user after creation" do
    allow(person).to receive(:send_email).with(:fundraiser_pledge_made, anything).exactly(1).times
    fundraiser.pledges.create person: person, amount: '13.37'
  end

  describe "survey_email" do
    it "should send reward survey email if funding goal reached" do
      fundraiser.pledges.create person: person, amount: 100

      allow(fundraiser).to receive(:delay).with(:send_reward_survey_email).exactly(1).times
      allow(fundraiser).to receive(:delay).with(:send_funding_goal_reached_notification).exactly(1).times
    end

    it "should send reward survey email if funding goal reached" do
      fundraiser.pledges.create person: person, amount: 1

      allow(fundraiser).to receive(:delay).exactly(0).times
    end
  end

  describe "notify creator" do
    let(:creator) { create(:person) }
    let(:stub_creator) { create(:person) }
    let(:amount) { 99 }

    before do
      allow(fundraiser).to receive(:person).and_return(creator, stub_creator)
      allow(stub_creator).to receive(:send_email).with(:fundraiser_backed, fundraiser: fundraiser, backer: person, amount: amount).exactly(1).times
    end
    it "should send email to creator after created" do
      fundraiser.pledges.create person: person, amount: amount
    end
  end

  describe '50% milestone' do
    let(:creator) { create(:person) }

    describe 'reached' do
      let(:stub_creator) { create(:person) }

      describe 'not to 100%' do
        let(:amount) { 51 }

        before do
          allow(fundraiser).to receive(:person).and_return(creator, stub_creator)
          allow(creator).to receive(:send_email).with(:funding_goal_half_reached_notification_to_creator, fundraiser: fundraiser).exactly(1).times
        end

        it "should send email to creator after created" do
          fundraiser.pledges.create person: person, amount: amount
        end
      end

      describe 'to 100%' do
        let(:amount) { 100 }

        before do
          allow(fundraiser).to receive(:person).and_return(creator)
          allow(creator).to receive(:send_email).with(:funding_goal_half_reached_notification_to_creator, fundraiser: fundraiser).exactly(1).times
        end

        it "should send email to creator after created" do
          fundraiser.pledges.create person: person, amount: amount
        end
      end
    end

    describe 'not reached' do
      let(:amount) { 49 }
      before do
        allow(fundraiser).to receive(:person).and_return(creator)
        allow(creator).to receive(:send_email).with(:funding_goal_half_reached_notification_to_creator, fundraiser: fundraiser).exactly(0).times
      end
      it "should send email to creator after created" do
        fundraiser.pledges.create person: person, amount: amount
      end
    end
  end

  it "should share the reward with all pledges for the same reward" do
    expect(pledge1.reward).to eq(reward)

    expect(pledge1.reward).to eq(pledge2.reward)

    # furthermore, the reward should know about all of its pledges
    expect(reward.pledges).to include pledge1, pledge2
  end

  describe "send_survey_email on funding goal being breached" do
    let(:fundraiser)  { create(:published_fundraiser, funding_goal: 100) }
    let(:reward)      { create(:reward, fundraiser: fundraiser, amount: 100, fulfillment_details: "I need ur address") }

    describe "with reward" do
      let!(:pledge) { create_pledge(100, person: person, fundraiser: fundraiser, reward: reward) }

      it "should trigger send email" do
        allow(person).to receive(:send_email).with(:pledge_survey_email, fundraiser: fundraiser, reward: reward, pledge: pledge).exactly(1).times
        pledge.send_survey_email
      end
    end

    describe "without reward" do
      let!(:pledge) { create_pledge(99, person: person, fundraiser: fundraiser) }

      it "should not trigger send email" do
        allow(person).to receive(:send_email).exactly(0).times
        pledge.send_survey_email
      end
    end
  end

  describe "reward" do
    let!(:fundraiser) { create(:published_fundraiser) }
    let!(:reward)     { create(:reward, fundraiser: fundraiser) }
    let(:backer)      { create(:person) }

    it "validate presence of fundraiser" do
      pledge = Pledge.new(person: backer, amount: 10)
      expect(pledge).not_to be_valid
      expect(pledge.errors).to have_key :fundraiser
    end

    it "should have reference to zero reward" do
      pledge = create(:pledge, fundraiser: fundraiser, person: backer, amount: 100)
      expect(pledge.reward).to eq(fundraiser.zero_reward)
    end

    it "should have reference to reward" do
      pledge = create(:pledge, fundraiser: fundraiser, person: backer, amount: 100, reward: reward)
      expect(pledge.reward).to eq(reward)
    end
  end

  describe "account" do
    let(:fundraiser)  { create(:fundraiser) }
    let!(:pledge)     { create_pledge(10, fundraiser: fundraiser) }

    it "should have fundraiser account" do
      expect(pledge.reload.account).to eq(fundraiser.account)
    end
  end

  describe "displayed pledge total" do
    let(:fundraiser) { create(:fundraiser) }

    it "should be 0" do
      expect(fundraiser.total_pledged).to eq(0)
    end

    it "should still be 0" do
      fundraiser.update_total_pledged
      expect(fundraiser.total_pledged).to eq(0)
    end

    it "should trigger bounty_total update" do
      expect(fundraiser).to receive(:update_total_pledged).once
      create_pledge(100, fundraiser: fundraiser)
    end
  end

  describe "TEMP HACK: survey response load" do
    let(:fundraiser) { create(:published_fundraiser) }
    let(:reward) { fundraiser.rewards.create(amount: 100, description: "beep", fulfillment_details: "Beep boop?") }
    let(:person) { create(:person) }

    it "should consume survey_response from temp table" do
      response = "Beeeeeep!"
      PledgeSurveyResponse.create(person: person, reward: reward, survey_response: response)
      pledge = fundraiser.pledges.create(amount: 100, reward: reward, person: person)
      pledge.reload
      expect(pledge.survey_response).to eq(response)
    end
  end

  describe '#after_purchase' do
    shared_examples_for 'a checkout method' do
      let(:pledge) { create(:pledge) }
      let(:order) { create(:transaction) }

      it 'should not overwrite owner' do
        person = create(:person)
        pledge.owner = person
        expect { pledge.after_purchase(order) }.not_to(change(pledge, :owner))
      end
    end

    describe 'Team Account' do
      let(:team) { create(:team) }
      let(:checkout_method) { Account::Team.instance }
      it_behaves_like 'a checkout method'
    end
  end
end
