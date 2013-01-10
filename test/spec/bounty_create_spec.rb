require "spec_helper"

describe "Bounty Creation" do
  before(:all) do
    # log this browser into the dev paypal account
    unless @browser.input(id: 'login_email').present?
      @browser.goto "https://developer.paypal.com/"

      email_input     = @browser.input(id: 'login_email')
      password_input  = @browser.input(id: 'login_password')
      email_input.wait_until_present

      email_input.send_keys     "warren@badger.com"
      password_input.send_keys  "p8DY3mrQ"
      @browser.button(value: 'Log In').click
    end
  end

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
    @browser.input(id: 'login_email').wait_until_present
    @browser.input(id: 'login_email').send_keys     "warren_1346807229_per@badger.com"
    @browser.input(id: 'login_password').send_keys  "346807220"
    @browser.button(id: 'submitLogin').click

    @browser.checkbox(id: 'esignOpt').wait_until_present
    @browser.checkbox(id: 'esignOpt').click
    @browser.button(id: 'agree').click

    @browser.button(id: 'continue_abovefold').wait_until_present
    @browser.button(id: 'continue_abovefold').click
  end
end