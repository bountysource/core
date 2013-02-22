require 'spec_helper'

describe "Fundraiser Pledges" do
  it "should pledge to fundraiser and select a reward" do
    login_with_email!

    @browser.goto "#"

    # find a fundraiser card and click on it
    bounty_card = @browser.a(text: 'Pledge!')
    bounty_card.wait_until_present

    # goto_route instead of .click because it sometimes doesn't scroll enough and chatbar gets the click
    @browser.goto '#'+bounty_card.href.split('#').last

    @browser.a(text: 'Make a Pledge').when_present.click

    # make a pledge to this fundraiser
    @browser.text_field(id: 'pledge-amount').when_present.set(25)
    @browser.radio(id: 'payment_method_paypal').click

    # select a reward
    @browser.div(id: 'fundraiser-rewards').divs.first.click

    @browser.button(value: 'Continue to Payment').click
    proceed_through_paypal_sandbox_flow!

    @browser.h2(text: /\$\d+\s+pledge\s+made/i).wait_until_present
  end
end