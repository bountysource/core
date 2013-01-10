require "spec_helper"

describe "Bounty Creation" do
  before(:all) { login_to_paypal_sandbox! }

  specify do
    @browser.goto_route "#"

    # find a bounty card and click on it
    bounty_card = @browser.div(class: 'card').a(text: 'Back this!')
    bounty_card.wait_until_present
    bounty_card.click

    # fill in bounty amount, select paypal and submit bounty create
    bounty_input = @browser.input(id: 'amount-input')
    bounty_input.wait_until_present
    @browser.radio(id: 'payment_method_paypal').click
    bounty_input.send_keys 25
    @browser.button(value: 'Create Bounty').click

    # go through paypal flow
    proceed_through_paypal_sandbox_flow!
  end
end