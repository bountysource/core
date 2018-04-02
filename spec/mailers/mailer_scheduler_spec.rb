      require 'spec_helper'

describe MailerScheduler do
  let(:issue) { create(:closed_issue) }
  let(:issue_backer) { create(:person) }
  let(:bounty) { create(:bounty, issue: issue, person: issue_backer)}

  #claim that will auto-payout in 7 days
  let(:bounty_claim_7) { create(:bounty_claim, issue: issue, collected: false, created_at: 7.days.ago)}
  
  #claim that will auto-payout in 1 days
  let(:bounty_claim_1) { create(:bounty_claim, issue: issue, collected: false, created_at: 13.days.ago)} 
  
  #untimely claim that should not show up in queries
  let(:old_bounty_claim) { create(:bounty_claim, issue: issue, collected: false, created_at: 16.days.ago)}

  #claim that is disputed
  let(:disputed_bounty_claim) { create(:bounty_claim, issue: issue, collected: false, disputed: true, created_at: 7.days.ago)}

  #claim that has already been collected
  let(:collected_bounty_claim) { create(:bounty_claim, issue: issue, collected: true, disputed: false, created_at: 7.days.ago)}


 
  describe "#remind_unresponsive_backers" do
    context "with an unresponsive backer on an undisputed bounty_claim within 7 days" do
      it "should call the send email method for an unresponsive backer" do
        bounty #initialize bounty
        bounty_claim_7
        allow_any_instance_of(BountyClaim).to receive(:unresponsive_backers).and_return([issue_backer])
        expect(issue_backer).to receive(:send_email).with(:remind_unresponsive_backers_of_bounty_claim, anything()).once
        MailerScheduler.remind_unresponsive_backers(7)
      end
    end

    context "with an unresponsive back on an undisputed bounty_claim that will close in 1 day" do
      it "should call the send_email method for the unresponsive backer" do
        bounty
        bounty_claim_1
        allow_any_instance_of(BountyClaim).to receive(:unresponsive_backers).and_return([issue_backer])
        expect(issue_backer).to receive(:send_email).with(:remind_unresponsive_backers_of_bounty_claim, anything()).once
        MailerScheduler.remind_unresponsive_backers(1)
      end
    end
  end

  describe "#find_timely_claims" do
    context "with a bounty claim about to auto-payout in 7 days" do
      it "should find the bounty claim" do
        bounty_claim_7
        old_bounty_claim
        expect(MailerScheduler.find_timely_claims(7).length).to eq(1)
      end
    end

    context "with a bounty claim about to auto-payout in 1 day" do
      it "should find the bounty claim" do
        bounty_claim_1
        old_bounty_claim
        expect(MailerScheduler.find_timely_claims(1).length).to eq(1)
      end
    end

    context "with no bouty claims that aren't in the relevant time frame" do
      it "should find NO bounty_claims" do
        #neither of these bounty claims will auto-payout in 7 days
        old_bounty_claim
        bounty_claim_1
        expect(MailerScheduler.find_timely_claims(7).length).to eq(0)
      end
    end

    context "with bounty claims in the relevant timeframe that are disputed" do
      it "should return NO bounty_claims" do
        disputed_bounty_claim
        expect(MailerScheduler.find_timely_claims(7).length).to eq(0)
      end
    end

    context "with bounty claims in the relevant time frame that have already been collected" do
      it "should return NO bounty_claims" do
        collected_bounty_claim
        expect(MailerScheduler.find_timely_claims(7).length).to eq(0)
      end
    end
  end
end
