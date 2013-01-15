require 'spec_helper'

describe "Claiming a Bounty" do
  it "should find a bounty on the home page" do
    # find a bounty card and click on it
    bounty_card = @browser.div(class: 'card').a(text: 'Back this!')
    bounty_card.wait_until_present
    bounty_card.click
  end

  it "should be able to get to #bounties from home page when logged in" do
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

    # goto_route instead of .click because it sometimes doesn't scroll enough and chatbar gets the click
    @browser.goto_route '#'+issue_links.sample.href.split('#').last

    @browser.url.should =~ /#repos\/\w+\/\w+\/issues\/\d+$/
  end

  # TODO this test needs to be mocked
  it "should see a list of pull requests after logging in" do
    @browser.goto_route '#repos/coryboyd/bs-test/issues/18'

    # not yet logged in, so a github login button should be present
    @browser.a(text: 'Link with GitHub').wait_until_present
    @browser.a(text: 'Link with GitHub').click

    @browser.select(name: 'pull_request_number').wait_until_present
  end

  it "should show a 'claim bounty' button when developer's solution is accepted and dispute period is over" do
    # accepted solution
    solutions = [
      {
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
          title: "Test issue",
          repository: {
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test"
          },
          number: 1
        }
      }
    ]

    login_with_email!

    # mock the user info api call to return an accepted solution
    @browser.override_api_response_data :get_solutions, success: true, data: solutions
    @browser.div(id: 'user-nav').hover
    @browser.a(text: 'Solutions').wait_until_present
    @browser.a(text: 'Solutions').click


    @browser.table(class: 'solutions').wait_until_present
    @browser.a(text: 'Claim Bounty!').wait_until_present

    # unmock the user info api call
    @browser.restore_api_method :get_solutions
  end

  it "should show 'in dispute period' message when pull request merged and in dispute period" do
    # solution in dispute period
    solutions = [
      {
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
          title: "Test issue",
          repository: {
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test"
          },
          number: 1
        }
      }
    ]

    login_with_email!

    # mock the user info api call to return an accepted solution
    @browser.override_api_response_data :get_solutions, success: true, data: solutions
    @browser.div(id: 'user-nav').hover
    @browser.a(text: 'Solutions').wait_until_present
    @browser.a(text: 'Solutions').click

    @browser.table(class: 'solutions').wait_until_present
    @browser.p(text: 'Solution has been merged, but is in the dispute period.').wait_until_present

    # unmock the user info api call
    @browser.restore_api_method :get_solutions
  end

  it "should show 'disputed' message if the solution is being disputed" do
    # accepted, but disputed solution
    solutions = [
      {
        accepted: true,
        pull_request: {
          merged_at: DateTime.now,
          mergeable: true,
          merged: true
        },
        disputed: true,
        accepted_at: DateTime.now,
        created_at: DateTime.now,
        in_dispute_period: true,
        issue: {
          title: "Test issue",
          repository: {
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test"
          },
          number: 1
        }
      }
    ]

    login_with_email!

    # mock the user info api call to return an accepted solution
    @browser.override_api_response_data :get_solutions, success: true, data: solutions
    @browser.div(id: 'user-nav').hover
    @browser.a(text: 'Solutions').wait_until_present
    @browser.a(text: 'Solutions').click

    @browser.table(class: 'solutions').wait_until_present
    @browser.p(text: 'Solution has been disputed, and is currently under review.').wait_until_present

    # unmock the user info api call
    @browser.restore_api_method :get_solutions
  end

  describe "payout" do
    before(:all) do
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
          bounty_total: 100,
          title: "Test issue",
          repository: {
            project_tax: 0.1,
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test"
          },
          number: 1
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
        in_dispute_period: true,
        issue: {
          bounty_total: 100,
          title: "Test issue",
          repository: {
            project_tax: 0.1,
            owner: {
              avatar_url: "images/github.png",
              login: "test"
            },
            full_name: "test/test",
            display_name: "Test"
          },
          number: 1
        }
      }
    end

    it "should not show payout page for solution that have not yet been accepted" do
      login_with_email!

      @browser.override_api_response_data :get_solution, success: true, data: @disputed_solution
      @browser.goto_route "#solutions/#{@disputed_solution[:id]}/payout"

      @browser.a(text: @disputed_solution[:issue][:title]).wait_until_present

      @browser.h2(text: 'Physical Check').present?.should be_false
      @browser.div(class: 'error-message', text: 'Solution has not yet been accepted.').present?.should be_true

      @browser.restore_api_method :get_solution
    end

    it "should show payout page for accepted solution" do
      login_with_email!

      @browser.override_api_response_data :get_solution, success: true, data: @accepted_solution
      @browser.goto_route "#solutions/#{@accepted_solution[:id]}/payout"

      @browser.a(text: @accepted_solution[:issue][:title]).wait_until_present
      @browser.h2(text: 'Physical Check').wait_until_present

      @browser.restore_api_method :get_solution
    end

    it "should link a paypal account for payment" do
      login_with_email!

      @browser.override_api_response_data :get_solution, success: true, data: @accepted_solution
      @browser.override_api_response_data :link_paypal_account, success: true
      @browser.goto_route "#solutions/#{@accepted_solution[:id]}/payout"

      @browser.a(text: @accepted_solution[:issue][:title]).wait_until_present
      @browser.a(text: 'Paypal').click
      @browser.input(name: 'paypal_email').wait_until_present
      @browser.input(name: 'paypal_email').send_keys              'test@test.com'
      @browser.input(name: 'paypal_email_confirmation').send_keys 'test@test.com'
      @browser.button(value: 'Link Paypal Account').click

      @browser.url.should =~ /\#solutions\/\d+\/payout\/donation$/
    end

    it "should interact with donation sliders" do
      # helper to adjust value of donation sliders
      set_slider_value = lambda { |e, value|
        @browser.execute_scopejs_script "var e = document.getElementById('#{e.attribute_value 'id'}'); if (e) { e.value = #{value} }"
        e.fire_event 'change'
      }

      # helper to get value of slider
      slider_value = lambda { |e|
        @browser.execute_scopejs_script "var e = document.getElementById('#{e.attribute_value 'id'}'); if (e) { return e.value }"
      }

      login_with_email!

      @browser.override_api_response_data :get_solution, success: true, data: @accepted_solution

      @browser.goto_route "#solutions/#{@accepted_solution[:id]}/payout/donation"

      bountysource_tax  = @accepted_solution[:issue][:bounty_total] * @accepted_solution[:bounty_source_tax]
      # note: project tax is not deducted like bountysource tax.
      # project tax is the minimum donation on the project slider.
      total_bounty      = @accepted_solution[:issue][:bounty_total] - bountysource_tax
      project_tax       = total_bounty * @accepted_solution[:issue][:repository][:project_tax]

      @browser.div(id: 'bounty-amount').wait_until_present
      @browser.div(id: 'bounty-amount', text: "$#{total_bounty.to_i}").present?.should be_true

      # make sure that the project tax min value is set correctly
      project_slider = @browser.input(class: 'donation-slider', name: 'project')
      project_slider.present?.should be_true
      project_slider.attribute_value('min').should match_money(project_tax)

      project_slider = @browser.input(class: 'donation-slider', name: 'project')
      charity_slider = @browser.input(class: 'donation-slider', name: 'charity')
      project_slider.present?.should be_true
      charity_slider.present?.should be_true

      # put $20 on project, none on charity
      set_slider_value[project_slider, 20]
      set_slider_value[charity_slider, 0]
      @browser.div(id: 'total-cut').text.should match_money(total_bounty - 20)
      @browser.div(id: 'donation-total').text.should match_money(20)

      # put $20 on charity, none on project. take into account min value of project (optional project tax)
      set_slider_value[project_slider, 0]
      set_slider_value[charity_slider, 20]
      @browser.div(id: 'total-cut').text.should match_money(total_bounty - (20 + project_tax))
      @browser.div(id: 'donation-total').text.should match_money(20)

      # put all money on charity
      set_slider_value[charity_slider, total_bounty]
      @browser.div(id: 'total-cut').text.should match_money(0)
      @browser.div(id: 'donation-total').text.should match_money(total_bounty)

      # put all on project, and then put half on charity
      set_slider_value[project_slider, total_bounty]
      set_slider_value[charity_slider, 0]
      @browser.div(id: 'total-cut').text.should match_money(0)
      @browser.div(id: 'donation-total').text.should match_money(total_bounty)
      set_slider_value[charity_slider, total_bounty / 2]
      slider_value[project_slider].should match_money(total_bounty / 2)
      slider_value[charity_slider].should match_money(total_bounty / 2)
    end
  end
end