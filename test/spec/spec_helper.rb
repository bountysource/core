require "bundler"
Bundler.require

CREDENTIALS = YAML.load_file(File.expand_path('../../config/credentials.yml', __FILE__))
BASE_URL = ENV['RAILS_ENV'] == 'staging' ? 'https://www-qa.bountysource.com/' : 'http://www.bountysource.dev/'
API_ENDPOINT = 'qa'  # 'dev'

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

def login_with_email!
  return if @browser.div(id: 'user-nav').present?

  @bountysource_credentials = CREDENTIALS["bountysource"]

  @browser.goto_route '#signin/email'

  # login with email and password
  @browser.text_field(name: 'email').set(@bountysource_credentials["email"])
  @browser.text_field(name: 'password').set(@bountysource_credentials["password"])
  @browser.div(text: /Email address found/).wait_until_present
  @browser.button(value: 'Sign In').click
  @browser.div(id: 'user-nav').wait_until_present
end

def login_with_github!
  github_credentials = CREDENTIALS["github"]
  @browser.text_field(id: 'login_field').set(github_credentials["username"])
  @browser.text_field(id: 'password').set(github_credentials["password"])
  @browser.button(value: 'Sign in').click

  # auto authorize
  @browser.button(text: 'Authorize app').click if @browser.button(text: 'Authorize app').present?
end

# matches money.
RSpec::Matchers.define :match_money do |value|
  match do |value|
    parts = value.to_f.to_s.split('.')
    parts[1] = (parts[1]+'0')[0..1]
    regex = Regexp.new(parts.length == 2 ? "^\$?#{parts[0]}\.#{parts[1]}$" : "^\$?#{parts[0]}$")
    !!((parts.join('.')). =~ regex)
  end
end

RSpec.configure do |config|
  config.before(:suite) do
    puts ">> opening browser"

    $browser = ENV['RAILS_ENV'] == 'staging' ? Watir::Browser.new(:remote, :url => 'http://165.225.134.232:9515/') : Watir::Browser.new(:chrome)

    # add a navigate method for scope.js routes
    class << $browser
      # execute javascript in the scope.js instance
      def execute_scopejs_script(src)
        execute_script "with (scope.instance) { #{src} }"
      end

      # goto route.
      def goto_route(route)
        goto "#{BASE_URL}#{route}"

        # ensure we're using the correct API_ENDPOINT
        if BASE_URL =~ /bountysource\.dev/
          $browser.div(id: 'dev-bar').wait_until_present
          if $browser.div(id: 'dev-bar').a(text: API_ENDPOINT).exists?
            $browser.div(id: 'dev-bar').a(text: API_ENDPOINT).click
            $browser.div(id: 'dev-bar').b(text: API_ENDPOINT).wait_until_present
          end
        end
      end

      def mock_api!
        execute_scopejs_script %(
          with (scope('BountySource')) {
            define('_original_api', api);
            define('api', function() { console.log('API CALLED', arguments) });
          }
        )
      end

      def restore_api!
        execute_scopejs_script %(
          with (scope('BountySource')) {
            define('api', _original_api);
            delete BountySource._original_api;
          }
        )
      end

      # override an API method. results of block will be passed as response.data
      def override_api_response_data(method, options={})
        success = options[:success].nil? ? true : options[:success]
        # if not status provided, use success to make it 200 or 400
        status  = options[:status].nil? ? (success ? 200 : 400) : options[:status]

        execute_scopejs_script %(
          with (scope('BountySource')) {
            define('_original_#{method}', #{method});
            define('#{method}', function() {
              var arguments = flatten_to_array(arguments);
              var callback = shift_callback_from_args(arguments);
              callback({ data: #{options[:data].to_json}, meta: { status: #{status}, success: #{success} } });
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

      # a breakpoint that halts testing until browser window clicked.
      def breakpoint!
        puts ">> breakpoint reached. click anywhere in the browser to continue"

        execute_scopejs_script %(
          _breakpoint_overlay = div({
            id: '_breakpoint_overlay',
            style: 'background-color: #000; opacity: 0.6; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; text-align: center;',
            onClick: function() { App.remove_element('_breakpoint_overlay'); }
          }, p({ style: 'margin-top: 150px; font-size: 50px;' }, 'Click anywhere to continue...'));
          document.body.appendChild(_breakpoint_overlay);
          console.log("** Breakpoint reached **");
         )

        while execute_scopejs_script("return document.getElementById('_breakpoint_overlay');") do
          sleep 0.25 # waiting a little
        end

        puts ">> continuing from breakpoint"
      end
    end

    #
    #puts ">> authenticating with PayPal master account for sandbox"
    #master_credentials = CREDENTIALS["paypal"]["master"]
    #$browser.goto "https://developer.paypal.com/"
    #$browser.input(id: 'login_email').wait_until_present
    #$browser.input(id: 'login_email').send_keys(master_credentials["email"])
    #$browser.input(id: 'login_password').send_keys(master_credentials["password"])
    #$browser.button(value: 'Log In').click
    #$browser.a(text: 'preconfigured account').wait_until_present

    puts ">> running specs\n"
  end

  config.before(:all) do
    @browser = $browser
  end

  config.before(:each) do
    $browser.goto_route '#' unless $browser.url =~ /\#$/
    $browser.execute_scopejs_script "BountySource.logout();"
  end

  config.after(:suite) do
    puts "\n\n>> closing browser"
    $browser.close
  end
end