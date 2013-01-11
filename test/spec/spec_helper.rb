require "rspec"
require "watir-webdriver"

def login_to_paypal_sandbox!
  @master_credentials = YAML.load_file('../config/credentials.yml')["paypal"]["master"]

  # log this browser into the dev paypal account
  @browser.goto "https://developer.paypal.com/"

  email_input     = @browser.input(id: 'login_email')
  password_input  = @browser.input(id: 'login_password')
  email_input.wait_until_present

  email_input.send_keys     @master_credentials["email"]
  password_input.send_keys  @master_credentials["password"]

  @browser.button(value: 'Log In').click
end

def proceed_through_paypal_sandbox_flow!
  @buyer_credentials = YAML.load_file('../config/credentials.yml')["paypal"]["buyer"]

  @browser.input(id: 'login_email').wait_until_present
  @browser.input(id: 'login_email').send_keys     @buyer_credentials["email"]
  @browser.input(id: 'login_password').send_keys  @buyer_credentials["password"]
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
    @github_credentials = YAML.load_file('../config/credentials.yml')["github"]

    @browser.input(id: 'login_field').wait_until_present
    @browser.input(id: 'login_field').send_keys @github_credentials["username"]
    @browser.input(id: 'password').send_keys    @github_credentials["password"]
    @browser.input(value: 'Sign in').click
  end
end

RSpec.configure do |config|
  config.before(:all) do
    puts "opening browser"
    @browser = Watir::Browser.new :chrome #, :switches => %w[--ignore-certificate-errors --disable-popup-blocking --disable-translate]

    # add a navigate method for scope.js routes
    class << @browser
      # execute javascript in the scope.js instance
      def execute_scopejs_script(src)
        execute_script "with (scope.instance) { #{src} }"
      end

      def goto_route(route)
        # goto "https://www-qa.bountysource.com/#{route}"
        goto "http://www.bountysource.dev/#{route}"
      end

      # override an API method. results of block will be passed as response.data
      def override_api_response_data(method, data, options={})
        execute_scopejs_script %(
          with (scope('BountySource')) {
            define('_original_#{method}', #{method});
            define('#{method}', function() {
              var arguments = flatten_to_array(arguments);
              var callback = shift_callback_from_args(arguments);
              callback({ data: #{data.to_json}, meta: { success: #{options[:success].nil? ? true : options[:success]} } });
            });
          }
        )
      end

      # restore a method that was previously mocked
      def restore_api_method(method)
        execute_scopejs_script %(
          with (scope('BountySource')) {
            define('#{method.to_s}', _original_#{method.to_s});
            delete BountySource._original_#{method.to_s};
          }
        )
      end
    end
  end

  config.after(:all) do
    puts "closing browser"
    @browser.close
  end
end