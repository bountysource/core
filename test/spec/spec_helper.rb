require "rspec"
require "watir-webdriver"

def login_to_paypal_sandbox!
  # log this browser into the dev paypal account
  @browser.goto "https://developer.paypal.com/"

  email_input     = @browser.input(id: 'login_email')
  password_input  = @browser.input(id: 'login_password')
  email_input.wait_until_present

  email_input.send_keys     "warren@badger.com"
  password_input.send_keys  "p8DY3mrQ"
  @browser.button(value: 'Log In').click
end

def proceed_through_paypal_sandbox_flow!
  @browser.input(id: 'login_email').wait_until_present
  @browser.input(id: 'login_email').send_keys     "warren_1346807229_per@badger.com"
  @browser.input(id: 'login_password').send_keys  "346807220"
  sleep 2
  @browser.button(id: 'submitLogin').click

  @browser.checkbox(id: 'esignOpt').wait_until_present
  @browser.checkbox(id: 'esignOpt').click
  sleep 2
  @browser.button(id: 'agree').click

  @browser.button(id: 'continue_abovefold').wait_until_present
  sleep 2
  @browser.button(id: 'continue_abovefold').click
end

def login_with_github!
  @browser.goto 'https://github.com/login'
  # return if already logged in to GitHub
  unless @browser.div(id: 'user-links').present?
    @browser.input(id: 'login_field').wait_until_present
    @browser.input(id: 'login_field').send_keys "bountysource-qa"
    @browser.input(id: 'password').send_keys    "badger42"
    @browser.input(value: 'Sign in').click
  end
end

RSpec.configure do |config|
  config.before(:all) do
    @browser = Watir::Browser.new :chrome, :switches => %w[--ignore-certificate-errors --disable-popup-blocking --disable-translate]

    # add a navigate method for scope.js routes
    class << @browser
      # execute javascript in the scope.js instance
      def execute_scopejs_script(src)
        execute_script "with (scope.instance) { #{src} }"
      end

      def goto_route(route)
        goto "https://www-qa.bountysource.com/#{route}"
      end
    end
  end

  config.after(:all) do
    @browser.close
  end
end