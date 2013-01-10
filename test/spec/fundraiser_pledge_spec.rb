require 'spec_helper'

describe "Fundraiser Pledges" do
  before(:all) { login_to_paypal_sandbox! }

  specify do
    @browser.goto_route "#"

    # find a fundraiser card and click on it
    bounty_card = @browser.a(text: 'Pledge!')
    bounty_card.wait_until_present
    bounty_card.click

    # make a pledge to this fundraiser
    @browser.input(id: 'amount').wait_until_present
    @browser.input(id: 'amount').send_keys 25
    @browser.radio(id: 'payment_method_paypal').click
    @browser.button(value: 'Make a Pledge').click

    proceed_through_paypal_sandbox_flow!

    @browser.h2(text: 'Thanks for your contribution').wait_until_present
  end
end