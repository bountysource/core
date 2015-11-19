# require 'spec_helper'
#
# describe "Issue" do
#
#   #describe "show page" do
#   #
#   #  describe "when issue is open and theres a bounty" do
#   #    it "shows bounty exists box" do
#   #      issue = create(:issue)
#   #
#   #      # initial bounty
#   #      person = create(:person)
#   #      bounty = create(:bounty, person: person, issue: issue)
#   #      visit "/issues/#{issue.id}"
#   #      expect(page).to have_content("This issue is currently open and has a $100 bounty from 1 backer.")
#   #
#   #      # increase bounty
#   #      bounty2 = create(:bounty, person: person, issue: issue)
#   #      visit "/issues/#{issue.id}"
#   #      expect(page).to have_content("This issue is currently open and has a $200 bounty from 1 backer.")
#   #
#   #      # bounty from new person
#   #      person2 = create(:person)
#   #      bounty3 = create(:bounty, person: person2, issue: issue)
#   #      visit "/issues/#{issue.id}"
#   #      expect(page).to have_content("This issue is currently open and has a $300 bounty from 2 backers.")
#   #
#   #      # refund
#   #      bounty2.refund!
#   #      visit "/issues/#{issue.id}"
#   #      expect(page).to have_content("This issue is currently open and has a $200 bounty from 2 backers.")
#   #    end
#   #  end
#   #
#   #  describe "when bounties are claimed" do
#   #    it "shows bounty awarded box" do
#   #      person = create(:person)
#   #      issue = create(:closed_issue)
#   #      bounty = create(:bounty, amount: 150, person: person, issue: issue)
#   #      bounty_claim = create(:bounty_claim, person: person, issue: issue, collected: true, amount: bounty.amount)
#   #      bounty_claim_response = create(:accepted_bounty_claim_response, bounty_claim: bounty_claim, description: "Great job buddy")
#   #
#   #      visit "/issues/#{issue.id}"
#   #      expect(page).to have_content("John Doe was awarded the $150 bounty")
#   #      expect(page).to have_content("Great job buddy")
#   #      expect(page).to have_link("View Code")
#   #    end
#   #  end
#   #
#   #end
#
#   describe "developers page" do
#     it "lets goal be created" do
#       issue = create(:issue)
#
#       visit "/issues/#{issue.id}/developers"
#       expect(page).to have_content("Are you a developer who can solve this issue?")
#
#       click_button "Get Started"
#       person = create(:person)
#       expect_signin(person)
#
#       current_path.should == "/issues/#{issue.id}/developers"
#       expect(page).to have_content("Are you a developer who can solve this issue?")
#       click_button "Get Started"
#
#       select 'Bounty too low', from: "developer_status"
#       fill_in "developer_goal_amount", with: '200'
#       click_button "Save"
#       expect(page).to have_content("John Doe set a goal of $200")
#
#       #
#       #bounty = create(:bounty, amount: 150, person: person, issue: issue)
#       #bounty_claim = create(:bounty_claim, person: person, issue: issue, collected: true, amount: bounty.amount)
#       #bounty_claim_response = create(:accepted_bounty_claim_response, bounty_claim: bounty_claim, description: "Great job buddy")
#       #
#       #visit "/issues/#{issue.id}"
#       #expect(page).to have_content("John Doe was awarded the $150 bounty")
#       #expect(page).to have_content("Great job buddy")
#       #expect(page).to have_link("View Code")
#     end
#   end
# end
