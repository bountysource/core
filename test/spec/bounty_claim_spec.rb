require 'spec_helper'

describe "Claiming a Bounty" do
  before(:all) { login_with_github! }

  after(:each) do
    @browser.execute_scopejs_script "BountySource.logout();"
  end

  it "should find a bounty on the home page" do
    @browser.goto_route "#"

    # find a bounty card and click on it
    bounty_card = @browser.div(class: 'card').a(text: 'Back this!')
    bounty_card.wait_until_present
    bounty_card.click
  end

  it "should be able to get to #bounties from home page when logged in" do
    @browser.goto_route "#"

    @browser.a(class: 'btn-auth btn-github large hover').wait_until_present
    @browser.a(class: 'btn-auth btn-github large hover').click

    @browser.button(text: 'Browse All Bounties').wait_until_present
    @browser.button(text: 'Browse All Bounties').click

    @browser.url.should =~ /#bounties/
    @browser.div(class: 'stats').wait_until_present
  end

  it "should find a large bounty on #bounties" do
    @browser.goto_route "#bounties"
    @browser.div(class: 'stats').wait_until_present

    # select a link from the table after featured projects, which contains issues
    issue_links = @browser.tables[1].links.select { |l| l.href =~ /#repos\/\w+\/\w+\/issues\/\d+$/ }

    # select a random issue to click
    issue_links.sample.click

    @browser.url.should =~ /#repos\/\w+\/\w+\/issues\/\d+$/
    @browser.div(id: 'bounty-box').wait_until_present
  end

  it "should see a list of pull requests after logging in" do
    @browser.goto_route '#repos/coryboyd/bs-test/issues/18'

    # not yet logged in, so a github login button should be present
    @browser.a(text: 'Link with GitHub').wait_until_present
    @browser.a(text: 'Link with GitHub').click

    @browser.select(name: 'pull_request_number').wait_until_present
  end
end