# == Schema Information
#
# Table name: bounty_claims
#
#  id          :integer          not null, primary key
#  person_id   :integer          not null
#  issue_id    :integer          not null
#  number      :integer
#  code_url    :string(255)
#  description :text
#  collected   :boolean
#  disputed    :boolean          default(FALSE), not null
#  paid_out    :boolean          default(FALSE), not null
#  rejected    :boolean          default(FALSE), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  amount      :decimal(, )      default(0.0), not null
#
# Indexes
#
#  index_bounty_claims_on_issue_id                (issue_id)
#  index_bounty_claims_on_person_id               (person_id)
#  index_bounty_claims_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

require 'spec_helper'

describe BountyClaim do

  let(:person) { create(:person) }
  let(:issue) { create(:closed_issue) }
  let!(:bounty) { create(:bounty, amount: 150, person: person, issue: issue) }

  it "should create bounty claim" do
    expect {
      create(:bounty_claim, person: person, issue: issue)
    }.to change(BountyClaim, :count).by 1
  end

  it "should require description and/or code_url" do
    bounty_claim = build(:bounty_claim, person: person, issue: issue, description: nil, code_url: nil)
    bounty_claim.should_not be_valid
  end

  it "should be valid with just code_url" do
    bounty_claim = build(:bounty_claim, person: person, issue: issue, code_url: "https://github.com/bountysource/frontend/pulls/1")
    bounty_claim.should be_valid
  end

  it "should be valid with just description" do
    bounty_claim = build(:bounty_claim, person: person, issue: issue, description: "This is valid!")
    bounty_claim.should be_valid
  end

  context "issue still open" do
    let(:issue) { create(:closed_issue) }

    before do
      issue.can_add_bounty = true
    end

    context "generic" do
      before do
        issue.stub(:generic?) { true }
      end

      it "should not require issue to be closed if it's a generic URL" do
        expect {
          create(:bounty_claim, person: person, issue: issue)
        }.to change(issue.bounty_claims, :count).by 1
      end
    end

    context "deep support" do
      before do
        issue.stub(:generic?) { false }
      end

      it "should require issue to be closed" do
        bounty_claim = build(:bounty_claim, person: person, issue: issue)
        bounty_claim.should_not be_valid
        bounty_claim.errors.should have_key :issue
      end
    end
  end

  describe "bounty claim submitted email" do
    it "should send email to developer" do
      person.stub(:send_email).with(:bounty_claim_submitted_developer_notice, anything).once
      create(:bounty_claim, person: person, issue: issue)
    end

    it "should send email to backers" do
      issue.backers.each { |backer| backer.stub(:send_email).with(:bounty_claim_submitted_backer_notice, anything).once }
      create(:bounty_claim, person: person, issue: issue)
    end
  end

  describe "bounty contested email" do
    let(:issue) { create(:closed_issue) }
    let(:person1) { create(:person) }
    let(:person2) { create(:person) }

    # create the first claim
    let!(:bounty_claim1) { create(:bounty_claim, issue: issue, person: person1) }

    before do
      Person.any_instance.stub(:send_email) { true }
    end

    it "should send email to all developers" do
      person1.stub(:send_email).with(:bounty_claim_contested_developer_notice, anything).once
      person2.stub(:send_email).with(:bounty_claim_contested_developer_notice, anything).once
      create(:bounty_claim, issue: issue, person: person2)
    end

    it "should send email to backers" do
      issue.backers.each { |backer| backer.stub(:send_email).with(:bounty_claim_contested_backer_notice, anything).once }
      create(:bounty_claim, person: person2, issue: issue)
    end
  end

  context "moar issues" do
    let!(:issues) { 3.times.map { create(:issue, can_add_bounty: false) } }

    it "should allow person to create claims on many different issues" do
      issues.each do |i|
        expect {
          bounty_claim = create(:bounty_claim, person: person, issue: i)
          bounty_claim.should be_valid
        }.to change(person.bounty_claims, :count).by 1
      end
    end
  end

  context "bounty claim exists" do
    let!(:bounty_claim) { create(:bounty_claim, person: person, issue: issue) }

    it "should only allow person to submit one claim per issue" do
      expect {
        # create() does a save! which throws error.
        # we just want to make sure you cannot save the model.
        build(:bounty_claim, person: person, issue: issue).save
      }.not_to change(BountyClaim, :count)
    end

    it "should be in dispute period" do
      bounty_claim.should be_in_dispute_period
    end

    it "should end dispute period on correct date" do
      bounty_claim.dispute_period_ends_at.should be == bounty_claim.created_at + Api::Application.config.dispute_period_length
    end

    it "should not be in dispute period if past the end date" do
      bounty_claim.created_at = DateTime.now - (2.weeks + 1.hour)
      bounty_claim.should_not be_in_dispute_period
    end

    context "outside of dispute period" do
      let(:bounty) { create(:bounty, amount: 1337, person: person, issue: issue) }

      before { bounty_claim.created_at = DateTime.now - (2.weeks + 1.hour) }

      it "should not accept" do
        expect {
          bounty_claim.accept!(bounty)
        }.not_to change(BountyClaimResponse, :count)
      end

      it "should not reject" do
        expect {
          bounty_claim.reject!(bounty, "Your code sux")
        }.not_to change(BountyClaimResponse, :count)
      end

      it "should not reset" do
        expect {
          bounty_claim.reset!(bounty)
        }.not_to change(BountyClaimResponse, :count)
      end
    end

    it "should only allow people that have placed bounties to respond to claims" do
      rebel_scum = create(:person)
      expect {
        bounty_claim.accept!(rebel_scum)
        bounty_claim.reject!(rebel_scum, "Your code sux")
        bounty_claim.reset!(rebel_scum)
      }.not_to change(rebel_scum.bounty_claim_responses, :count)
    end

    describe "contesting claims" do
      let(:issue1) { create(:issue, can_add_bounty: false) }
      let(:issue2) { create(:issue, can_add_bounty: false) }
      let!(:bounty_claim1) { create(:bounty_claim, issue: issue1) }
      let!(:bounty_claim2) { create(:bounty_claim, issue: issue1) }
      let!(:bounty_claim3) { create(:bounty_claim, issue: issue2) }

      it "should be contested" do
        bounty_claim1.should be_contested
        bounty_claim2.should be_contested
      end

      it "should not be contsted" do
        bounty_claim3.should_not be_contested
      end
    end

    describe "anonymity of bounty_claim_responses" do
      let(:bounty1) { create(:bounty, anonymous: true, amount: 15, person: create(:person), issue: issue)}
      let(:team) { create(:team) }
      let(:team_member_relation) { create(:developer, team: team) }
      let(:team_bounty) { create(:bounty, amount: 15, person: create(:person), owner: team, issue: issue)}

      it "should create a BountyClaimResponse that is anonymous for an anonymous bounty by a person" do
         bounty_claim.accept!(bounty1.person)
         bounty_claim.bounty_claim_responses.first.anonymous.should eq(true)
      end

      it "should create a non-anonymous BountyClaimResponse for a person accepting a bounty_claim on behalf of a team" do
        team_bounty #initialize
        bounty_claim.accept!(team_member_relation.person)
        bounty_claim.reload
        bounty_claim.bounty_claim_responses.first.anonymous.should eq(false)
      end
    end

    describe "approve and reject claims" do
      let!(:bounty1) { create(:bounty, anonymous: true, amount: 15, person: create(:person), issue: issue) }
      let!(:bounty2) { create(:bounty, amount: 15, person: create(:person), issue: issue) }
      let!(:bounty3) { create(:bounty, amount: 15, person: create(:person), issue: issue) }

      it "should create BountyClaimResponse on first accept!" do
        expect {
          bounty_claim.accept!(bounty1.person)
        }.to change(bounty_claim.bounty_claim_responses, :count).by 1
      end

      it "should create BountyClaimResponse on first reject!" do
        expect {
          bounty_claim.reject!(bounty1.person, "Your code sux")
        }.to change(bounty_claim.bounty_claim_responses, :count).by 1
      end

      it "should not create new BountyClaimResponse after initial creation" do
        bounty_claim.accept!(bounty1.person)
        expect {
          bounty_claim.reject!(bounty1.person, "Your code sux")
        }.not_to change(bounty_claim.bounty_claim_responses, :count)
      end

      it "should change BountyClaimResponse after initial creation" do
        bounty_claim.accept!(bounty1.person)

        # just get the last created BountyClaimResponse to test for change
        bounty_claim_response = bounty1.person.bounty_claim_responses.last

        expect {
          bounty_claim.reject!(bounty1.person, "Your code sux")
          bounty_claim_response.reload
        }.to change(bounty_claim_response, :value).to false
      end

      it "should reset response to nil" do
        bounty_claim.accept!(bounty1.person)

        # just get the last created BountyClaimResponse to test for change
        bounty_claim_response = bounty1.person.bounty_claim_responses.last

        expect {
          bounty_claim.reset!(bounty1.person)
          bounty_claim_response.reload
        }.to change(bounty_claim_response, :value).to nil
      end

      it "should set claim to disputed" do
        bounty_claim.should_not be_disputed

        expect {
          bounty_claim.reject!(bounty1.person, "Your code sux")
        }.to change(bounty_claim, :disputed).to true
      end

      it "should set claim to undisputed" do
        bounty_claim.reject!(bounty1.person, "Your code sux")
        bounty_claim.should be_disputed

        expect {
          bounty_claim.accept!(bounty1.person)
        }.to change(bounty_claim, :disputed).to false
      end

      it "should trigger collection on unanimous vote" do
        bounty_claim.stub(:collect!).exactly(1).times
        #this isn't actually testing if the method is called. this tests no matter what you set the expectation to!
        bounty_claim.accept!(bounty1.person)
        bounty_claim.accept!(bounty2.person)
        bounty_claim.accept!(bounty3.person)
      end

      describe "acceptance email" do
        it "should send email to developer on unanimous acceptance" do
          bounty_claim.person.stub(:send_email).with(:bounty_claim_accepted_developer_notice, anything).exactly(1).times

          bounty_claim.accept!(bounty1.person)
          bounty_claim.accept!(bounty2.person)
          bounty_claim.accept!(bounty3.person)
        end

        it "should send email to backers on unanimous acceptance" do
          issue.backers.each do |backer|
            backer.stub(:send_email).with(:bounty_claim_accepted_backer_notice, anything).exactly(1).times
          end

          bounty_claim.accept!(bounty1.person)
          bounty_claim.accept!(bounty2.person)
          bounty_claim.accept!(bounty3.person)
        end

        it "should not send email to developer without unanimous acceptance" do
          bounty_claim.person.stub(:send_email).with(:bounty_claim_accepted_developer_notice, anything).never

          bounty_claim.accept!(bounty1.person)
          bounty_claim.accept!(bounty2.person)
          bounty_claim.accept!(bounty3.person)
        end

        it "should not send email to backers without unanimous acceptance" do
          issue.backers.each do |backer|
            backer.stub(:send_email).with(:bounty_claim_accepted_backer_notice, anything).never
          end

          bounty_claim.accept!(bounty1.person)
          bounty_claim.accept!(bounty2.person)
          bounty_claim.accept!(bounty3.person)
        end
      end

      it "should not collect unless all of the backers voted" do
        bounty_claim.stub(:collect!).exactly(0).times

        bounty_claim.accept!(bounty1.person)
        bounty_claim.accept!(bounty2.person)
        bounty_claim.should_not be_collectible
      end

      it "should not collect when there are any rejections" do
        bounty_claim.stub(:collect!).exactly(0).times

        bounty_claim.accept!(bounty1.person)
        bounty_claim.accept!(bounty2.person)
        bounty_claim.reject!(bounty3.person, "Your code sux")
        bounty_claim.should_not be_collectible
      end

      it "should not collect with 100% rejection" do
        bounty_claim.stub(:collect!).exactly(0).times

        bounty_claim.reject!(bounty1.person, "Your code sux")
        bounty_claim.reject!(bounty2.person, "Your code sux")
        bounty_claim.reject!(bounty3.person, "Your code sux")
        bounty_claim.should_not be_collectible
      end

      describe "rejection email" do
        it "should send email to developer" do
          bounty_claim.person.stub(:send_email).with(:bounty_claim_rejected_developer_notice, anything).exactly(1).times
          bounty_claim.reject!(bounty1.person, "such rejection, wow")
        end

        it "should send email to backers" do
          issue.backers.each do |backer|
            backer.stub(:send_email).with(:bounty_claim_rejected_backer_notice, anything).exactly(1).times
          end
          bounty_claim.reject!(bounty1.person, "such rejection, wow")
        end

        it "should send email to rejecter" do
          bounty1.person.stub(:send_email).with(:bounty_claim_rejected_rejecter_notice, anything).exactly(1).times
          bounty_claim.reject!(bounty1.person, "such rejection, wow")
        end
      end
    end
  end

  describe "Cron" do
    let(:created_at) { DateTime.now - (Api::Application.config.dispute_period_length + 1.minute) }

    describe "1 eligible claim" do
      # the acceptable claim
      let!(:eligible_claim) { create(:bounty_claim, created_at: created_at) }

      let!(:claim_collected) { create(:bounty_claim, created_at: created_at, collected: true) }
      let!(:claim_rejected) { create(:bounty_claim, created_at: created_at, rejected: true) }

      # create a disputed claim by voting it down with a reject
      let!(:claim_disputed) { create(:bounty_claim) }
      let(:disputer) { create(:person) }
      let!(:bounty) { create(:bounty, amount: 123, person: disputer, issue: claim_disputed.issue) }

      before do
        claim_disputed.reject!(disputer, "This code sucks")
        claim_disputed.update_attribute :created_at, created_at

        # place a bounty on the issue for the acceptable claim
        create_bounty(100, issue: eligible_claim.issue)
      end

      it "should not accept disputed claim" do
        claim_disputed.should_receive(:collect!).never
        BountyClaim.accept_eligible!
      end

      it "should not accept reject claim" do
        claim_rejected.should_receive(:collect!).never
        BountyClaim.accept_eligible!
      end

      it "should not accept collected claim" do
        claim_collected.should_receive(:collect!).never
        BountyClaim.accept_eligible!
      end

      it "should trigger collection on eligible claim" do
        eligible_claim.issue.account_balance.should_not be_zero
        BountyClaim.accept_eligible!
        eligible_claim.reload.should be_collected
      end
    end

    describe "2 contested claims" do
      let(:issue) { create(:closed_issue) }

      let!(:claim1) { create(:bounty_claim, issue: issue, created_at: 3.weeks.ago) }
      let!(:claim2) { create(:bounty_claim, issue: issue, created_at: 3.weeks.ago) }

      it "should be constested" do
        claim1.should be_contested
        claim2.should be_contested
      end

      it "should not have any eligible claims" do
        eligible_claims = BountyClaim.accept_eligible!
        claim1.reload.should_not be_collected
        claim2.reload.should_not be_collected
      end
    end
  end

  describe "dispute emails" do
    let!(:backer1) { create(:person) }
    let!(:backer2) { create(:person) }
    let!(:issue) { create(:issue) }
    let!(:developer) { create(:person) }
    let!(:bounty_claim) { create(:bounty_claim, issue: issue, person: developer) }

    # give the backers bounties
    before do
      create_bounty(100, person: backer1, issue: issue)
      create_bounty(100, person: backer2, issue: issue)
      issue.update_attribute(:can_add_bounty, false)
    end

    it "should include backers" do
      issue.backers.should include backer1
      issue.backers.should include backer2
      issue.backers.should_not include developer
    end

    it "should email the developer if their claim is disputed" do
      bounty_claim.should_not be_disputed
      developer.should_receive(:send_email).with(:bounty_claim_rejected_developer_notice, anything).once
      bounty_claim.reject!(backer1, "lame code, bro")
    end
  end

  describe "#unresponsive_backers" do
    #person, issue, bounty created in the first describe block
    # we will use this bounty/person relation as the responsive_backer

    let!(:unresponsive_backer) { create(:person) }

    let!(:bounty_for_unresponsive_backer) { create(:bounty, person: unresponsive_backer, issue: issue) }

    let!(:bounty_claim) { create(:bounty_claim, issue: issue) }
    let!(:bounty_claim_response) { create(:accepted_bounty_claim_response, person: person, bounty_claim: bounty_claim) }

    it "should only return an array of the unresponsive_backers" do
      expect(bounty_claim.issue.backers.count).to eq(2)
      expect(bounty_claim.responsive_backers.count).to eq(1)
      expect(bounty_claim.unresponsive_backers.count).to eq(1)
    end
  end

  describe 'payout' do
    let(:issue) { create(:issue) }
    let!(:backer) { create(:person) }
    let!(:bounty) { create_bounty(150, person: backer, issue: issue) }
    let(:developer) { create(:person) }
    let!(:bounty_claim) { create(:bounty_claim, person: developer, issue: issue) }

    before do
      issue.update_attribute :can_add_bounty, false
    end

    it "should have a single backer" do
      issue.backers.count.should be == 1
    end

    it "should allow backer to respond to claims" do
      bounty_claim.person_can_respond?(backer).should be_truthy
    end

    it "should have money in issue account" do
      issue.account_balance.should be == bounty.amount
    end

    it "should trigger accept response creation" do
      BountyClaimResponse.should_receive(:find_or_create_by_claim_and_person).once
      bounty_claim.accept!(backer)
    end

    describe "is collectible" do

      before do
        bounty_claim.stub(:collectible?) { true }

        # fake the claim response, trigger collection by hand
        BountyClaimResponse.stub(:find_or_create_by_claim_and_person) do
          bounty_claim.collect!
        end
      end

      it "should trigger collection on unanimous acceptance" do
        bounty_claim.should_receive(:collect!).once
        bounty_claim.accept!(backer)
      end

      it "should trigger payout" do
        bounty_claim.should_receive(:payout!).once
        bounty_claim.collect!
      end

      it "should update issue on collection" do
        expect {
          bounty_claim.collect!
        }.to change(issue, :paid_out).to true
      end

      it "should update the amount on the bounty claim and set bounty status to paid" do
        payout_amount = bounty_claim.issue.bounties.where(status: Bounty::Status::ACTIVE).sum(:amount)
        bounty_claim.collect!
        expect(bounty_claim.amount).to eq(payout_amount)
        expect(bounty.reload.status).to eq(Bounty::Status::PAID)
        expect(issue.reload.bounty_total).to eq(0)
      end

      it "should create transaction" do
        expect {
          bounty_claim.accept!(backer)
        }.to change(Transaction, :count).by 1

        Transaction.last.should be_a Transaction::InternalTransfer::BountyClaim
      end

      it "should mark the claim as paid out" do
        expect {
          bounty_claim.accept!(backer)
        }.to change(issue.txns, :count).by 1
      end

      it "should add money to person's account" do
        expect {
          bounty_claim.collect!
          developer.reload
          issue.reload
        }.to change(developer, :account_balance).by issue.account_balance
      end

      it "should remove money from issue account" do
        expect {
          bounty_claim.collect!
          issue.reload
        }.to change(issue, :account_balance).to 0
      end

    end

  end

end
