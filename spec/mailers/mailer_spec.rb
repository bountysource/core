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
      email.from.should == %w(support@bountysource.com)
      email.to.should == [person.email]
      email.subject.should == 'Bounty created!'
      email.encoded.should include bounty.issue.to_param
      email.encoded.should include bounty.issue.title
      email.encoded.should match %r{created a \$\d+ bounty}
    end
  end

  describe "#bounty_placed" do
    let(:anon_email) do
      backer.send_email(:bounty_placed, bounty: anonymous_bounty)
    end

    it "should NOT render the owner name if the bounty is anonymous" do
      anon_email.to.should eq([backer.email])
      anon_email.encoded.should include "anonymous"
    end
  end

  describe "#bounty_increased" do
    let(:anon_email) do
      backer.send_email(:bounty_increased, bounty: anonymous_bounty)
    end

    it "should render 'Anonymous' instead of the bounty owner's name" do
      anon_email.to.should eq([backer.email])
      anon_email.encoded.should include "anonymous"
    end
  end

  describe "#repository_donation_made" do
    let(:amount) { Money.new(10*100, 'USD') }
    let(:email) do
      person.send_email(:repository_donation_made, repo: repository, amount: amount)
    end
    it "should correctly render the email" do
      email.from.should == %w(support@bountysource.com)
      email.to.should == [person.email]
      email.subject.should include "Thank you for your donation to"
      email.encoded.should include "You've just donated $#{amount.to_f.to_i}" # there is no Money#to_i method. bah.
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
      email.from.should == %w(support@bountysource.com)
      email.to.should == [person.email]
      email.subject.should match /ACTION NEEDED: funding goal reached for #{fundraiser.title}/i
    end
  end

  describe '#fundraiser_featured_notification' do
    let(:fundraiser) { create(:fundraiser) }
    let(:email) { fundraiser.send_fundraiser_featured_notification }

    it "should render email" do
      email.from.should == %w(support@bountysource.com)
      email.to.should == [fundraiser.person.email]
      email.subject.should == "Fundraiser #{fundraiser.title} is now FEATURED"
    end
  end

  describe '#fundraiser_backed' do
    let(:fundraiser) { create(:fundraiser) }
    let(:pledge) { create(:pledge, fundraiser: fundraiser, amount: 100) }
    let(:email) { fundraiser.person.send_email :fundraiser_backed, pledge: pledge }

    it "should render email" do
      email.from.should == %w(support@bountysource.com)
      email.to.should == [fundraiser.person.email]
      email.subject.should == "#{fundraiser.person.display_name} backed your fundraiser #{fundraiser.title}"
    end
  end
end
