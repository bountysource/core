require 'spec_helper'

describe "Claiming a Bounty" do
  it "should find a bounty on the home page" do
    bounty_card = nil
    @browser.div(class: 'card').wait_until_present
    @browser.divs(class: 'card').each do |e|
      if e.text =~ /Back this!/i
        bounty_card = e
        break
      end
    end
    bounty_card.should_not be_nil
  end

  it "should be able to get to #bounties from home page when logged in" do
    login_with_email!

    @browser.button(text: 'Browse All Bounties').when_present.click

    @browser.url.should =~ /#bounties/
    @browser.div(class: 'stats').wait_until_present
  end

  it "should find a large bounty on #bounties" do
    @browser.goto "#bounties"
    @browser.div(class: 'stats').wait_until_present

    # select a link from the table after featured projects, which contains issues
    issue_links = @browser.tables[1].links.select { |l| l.href =~ /#repos\/\w+\/\w+\/issues\/\d+$/ }

    # goto_route instead of .click because it sometimes doesn't scroll enough and chatbar gets the click
    @browser.goto '#'+issue_links.sample.href.split('#').last

    @browser.url.should =~ /#repos\/\w+\/\w+\/issues\/\d+$/
  end

  # TODO this test needs to be mocked
  it "should see a list of pull requests after logging in" do
    @browser.goto '#repos/coryboyd/bs-test/issues/18'

    # not yet logged in, so a github login button should be present
    @browser.a(text: 'Link with GitHub').when_present.click

    @browser.span(id: 'user_nav_name').wait_until_present
    @browser.goto '#repos/coryboyd/bs-test/issues/18'
    @browser.select(name: 'pull_request_number').wait_until_present
  end

  describe "solutions" do
    before(:each) do
      @solution = {
        id: 1,
        bounty_source_tax: 0.1,
        accepted: false,
        pull_request: {
          merged_at: nil,
          mergeable: false,
          merged: false
        },
        disputed: false,
        accepted_at: nil,
        created_at: DateTime.now,
        in_dispute_period: false,
        issue: {
          number: 1,
          title: "Test issue",
          body: "This is a test, please ignore",
          account_balance: 100,
          bounty_total: 100,
          closed: false,
          comment_count: 12,
          repository: {
            project_tax: 0.1,
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test",
            languages: [{ name: 'ruby', bytes: 1337 }]
          }
        }
      }

      @accepted_solution = {
        id: 1,
        bounty_source_tax: 0.1,
        accepted: true,
        pull_request: {
          merged_at: DateTime.now,
          mergeable: true,
          merged: true
        },
        disputed: false,
        accepted_at: DateTime.now,
        created_at: DateTime.now,
        in_dispute_period: false,
        issue: {
          number: 1,
          title: "Test issue",
          body: "This is a test, please ignore",
          account_balance: 100,
          bounty_total: 100,
          closed: true,
          comment_count: 12,
          repository: {
            project_tax: 0.1,
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test",
            languages: [{ name: 'ruby', bytes: 1337 }]
          }
        }
      }

      @in_dispute_period_solution = {
        id: 1,
        bounty_source_tax: 0.1,
        accepted: true,
        pull_request: {
          merged_at: DateTime.now,
          mergeable: true,
          merged: true
        },
        disputed: false,
        accepted_at: DateTime.now,
        created_at: DateTime.now,
        in_dispute_period: true,
        issue: {
          number: 1,
          title: "Test issue",
          body: "This is a test, please ignore",
          account_balance: 100,
          bounty_total: 100,
          closed: true,
          comment_count: 12,
          repository: {
            project_tax: 0.1,
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test",
            languages: [{ name: 'ruby', bytes: 1337 }]
          }
        }
      }

      @disputed_solution = {
        id: 1,
        bounty_source_tax: 0.1,
        accepted: true,
        pull_request: {
          merged_at: DateTime.now,
          mergeable: true,
          merged: true
        },
        disputed: true,
        accepted_at: DateTime.now,
        created_at: DateTime.now,
        in_dispute_period: false,
        issue: {
          number: 1,
          title: "Test issue",
          body: "This is a test, please ignore",
          account_balance: 100,
          bounty_total: 100,
          closed: true,
          comment_count: 12,
          repository: {
            project_tax: 0.1,
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test",
            languages: [{ name: 'ruby', bytes: 1337 }]
          }
        }
      }
    end

    it "should show a 'claim bounty' button when developer's solution is accepted and dispute period is over" do
      login_with_email!

      # mock the user info api call to return an accepted solution
      @browser.override_api_response_data :get_solutions, success: true, data: [@accepted_solution]
      @browser.override_api_response_data :get_solution, success: true, data: @accepted_solution

      @browser.goto "#solutions"

      @browser.table(class: 'solutions').wait_until_present
      row = @browser.table(class: 'solutions').rows[1]
      row.text.should match /Accepted!/i
      row.click

      @browser.a(text: 'Claim Bounty').wait_until_present

      # unmock the user info api call
      @browser.restore_api_method :get_solutions, :get_solution
    end

    it "should show 'in dispute period' message when pull request merged and in dispute period" do
      login_with_email!

      # mock the user info api call to return an accepted solution
      @browser.override_api_response_data :get_solutions, success: true, data: [@in_dispute_period_solution]
      @browser.override_api_response_data :get_solution, success: true, data: @in_dispute_period_solution

      @browser.goto "#solutions"

      @browser.table(class: 'solutions').wait_until_present
      row = @browser.table(class: 'solutions').rows[1]
      row.text.should match /In Dispute Period/i
      row.click

      @browser.p(text: 'Solution has been merged, but is in the dispute period.').wait_until_present

      # unmock the user info api call
      @browser.restore_api_method :get_solutions, :get_solution
    end

    it "should show 'disputed' message if the solution is being disputed" do
      login_with_email!

      # mock the user info api call to return an accepted solution
      @browser.mock_api!
      @browser.override_api_response_data :get_solutions, success: true, data: [@disputed_solution]
      @browser.override_api_response_data :get_solution, success: true, data: @disputed_solution

      @browser.goto "#solutions"

      @browser.table(class: 'solutions').wait_until_present
      row = @browser.table(class: 'solutions').rows[1]
      row.text.should match /Disputed/i
      row.click

      @browser.p(text: 'Solution has been disputed, and is currently under review.').wait_until_present

      # unmock the user info api call
      @browser.restore_api_method :get_solutions, :get_solution
    end
  end
end