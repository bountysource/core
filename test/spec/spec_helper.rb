require "bundler"
Bundler.require

CREDENTIALS = YAML.load_file(File.expand_path('../../config/credentials.yml', __FILE__))

def proceed_through_paypal_sandbox_flow!
  @buyer_credentials = CREDENTIALS["paypal"]["buyer"]

  @browser.text_field(id: 'login_email').wait_until_present
  @browser.text_field(id: 'login_email').set(@buyer_credentials["email"])
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
  return unless @browser.url== "https://github.com/login"

  @github_credentials = CREDENTIALS["github"]

  @browser.input(id: 'login_field').wait_until_present
  @browser.input(id: 'login_field').send_keys @github_credentials["username"]
  @browser.input(id: 'password').send_keys    @github_credentials["password"]
  @browser.input(value: 'Sign in').click
  @browser.ul(id: 'user-links').wait_until_present
end

RSpec.configure do |config|
  config.before(:suite) do
    puts ">> opening browser"

    $browser = (case Rails.env
                 when 'development' then Watir::Browser.new(:chrome)
                 when 'staging' then Watir::Browser.new(:remote, :url => 'http://165.225.134.232:9515/')
                 else raise "No browser configured for environment #{Rails.env}"
               end)

    # add a navigate method for scope.js routes
    class << $browser
      # execute javascript in the scope.js instance
      def execute_scopejs_script(src)
        execute_script "with (scope.instance) { #{src} }"
      end

      def goto_route(route)
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

    puts ">> setting API server to QA"
    $browser.goto_route "#not_found"
    $browser.div(id: 'dev-bar').wait_until_present
    $browser.div(id: 'dev-bar').a(text: 'qa').click if $browser.div(id: 'dev-bar').a(text: 'qa').exists?


    puts ">> authenticating with PayPal master account for sandbox"
    master_credentials = CREDENTIALS["paypal"]["master"]
    $browser.goto "https://developer.paypal.com/"
    $browser.input(id: 'login_email').wait_until_present
    $browser.input(id: 'login_email').send_keys(master_credentials["email"])
    $browser.input(id: 'login_password').send_keys(master_credentials["password"])
    $browser.button(value: 'Log In').click
    $browser.a(text: 'preconfigured account').wait_until_present

    puts ">> running specs\n"
  end

  config.before(:all) do
    @browser = $browser
  end

  config.before(:each) do
    @browser.goto_route '#'
    @browser.execute_scopejs_script "BountySource.logout();"
  end

  config.after(:suite) do
    puts "\n\n>> closing browser"
    $browser.close
  end
end