require "spec_helper"

describe Mailer do
  let(:person) { create(:person) }
  let(:backer) { create(:backer) }
  let(:repository) { create(:github_repository_with_issues) }
  let(:issue) { create(:github_issue, tracker: repository, number: 203) }
  let(:bounty) { create(:bounty, amount: 50.00, issue: issue, person: backer) }
  let(:anonymous_bounty) { create(:bounty, amount: 39.00, issue: issue, person: person, anonymous: true) }

  describe "#bounty_created" do
    let(:email) do
      person.send_email(:bounty_created, bounty: bounty)
    end

    it "should correctly render the email" do
      expect(email.from).to eq(%w(support@bountysource.com))
      expect(email.to).to eq([person.email])
      expect(email.subject).to eq('Bounty created!')
      expect(email.encoded).to include bounty.issue.to_param
      expect(email.encoded).to include bounty.issue.title
      expect(email.encoded).to match %r{created a \$\d+ bounty}
    end
  end

  describe "#bounty_placed" do
    let(:anon_email) do
      backer.send_email(:bounty_placed, bounty: anonymous_bounty)
    end

    it "should NOT render the owner name if the bounty is anonymous" do
      expect(anon_email.to).to eq([backer.email])
      expect(anon_email.encoded).to include "anonymous"
    end
  end

  describe "#bounty_increased" do
    let(:anon_email) do
      backer.send_email(:bounty_increased, bounty: anonymous_bounty)
    end

    it "should render 'Anonymous' instead of the bounty owner's name" do
      expect(anon_email.to).to eq([backer.email])
      expect(anon_email.encoded).to include "anonymous"
    end
  end

  describe "#repository_donation_made" do
    let(:amount) { Money.new(10*100, 'USD') }
    let(:email) do
      person.send_email(:repository_donation_made, repo: repository, amount: amount)
    end
    it "should correctly render the email" do
      expect(email.from).to eq(%w(support@bountysource.com))
      expect(email.to).to eq([person.email])
      expect(email.subject).to include "Thank you for your donation to"
      expect(email.encoded).to include "You've just donated $#{amount.to_f.to_i}" # there is no Money#to_i method. bah.
    end
  end


  describe '#pledge_survey_email' do
    let(:fundraiser) { create(:fundraiser) }
    let(:reward) { create(:reward, fundraiser: fundraiser, amount: 50, fulfillment_details: "I require your social security number") }
    let(:pledge) { create(:pledge, fundraiser: fundraiser, reward: reward, person: person, amount: 90) }
    let(:email) do
      pledge.send_survey_email
    end

    it "should render the email" do
      expect(email.from).to eq(%w(support@bountysource.com))
      expect(email.to).to eq([person.email])
      expect(email.subject).to match /ACTION NEEDED: funding goal reached for #{fundraiser.title}/i
    end
  end

  describe '#fundraiser_featured_notification' do
    let(:fundraiser) { create(:fundraiser) }
    let(:email) { fundraiser.send_fundraiser_featured_notification }

    it "should render email" do
      expect(email.from).to eq(%w(support@bountysource.com))
      expect(email.to).to eq([fundraiser.person.email])
      expect(email.subject).to eq("Fundraiser #{fundraiser.title} is now FEATURED")
    end
  end

  describe '#fundraiser_backed' do
    let(:fundraiser) { create(:fundraiser) }
    let(:pledge) { create(:pledge, fundraiser: fundraiser, amount: 100) }
    let(:email) { fundraiser.person.send_email :fundraiser_backed, pledge: pledge }

    it "should render email" do
      expect(email.from).to eq(%w(support@bountysource.com))
      expect(email.to).to eq([fundraiser.person.email])
      expect(email.subject).to eq("#{fundraiser.person.display_name} backed your fundraiser #{fundraiser.title}")
    end
  end
end
