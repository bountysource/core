require "bundler"
Bundler.require

CREDENTIALS = YAML.load_file(File.expand_path('../../config/credentials.yml', __FILE__))

if ENV['RAILS_ENV'] == 'staging'
  BASE_URL = 'https://www-qa.bountysource.com/'
  API_ENDPOINT = 'qa'
  DEMO_MODE = false
else
  #BASE_URL = 'https://www-qa.bountysource.com/'
  #API_ENDPOINT = 'qa'
  BASE_URL = 'http://www.bountysource.dev/'
  API_ENDPOINT = 'dev'
  DEMO_MODE = false
end


def proceed_through_paypal_sandbox_flow!
  # log in to master account if necessary
  @browser.a(text: /(PayPal Sandbox|User Agreement)/).wait_until_present
  if @browser.a(text: 'PayPal Sandbox').present?
    url = @browser.url

    master_credentials = CREDENTIALS["paypal"]["master"]
    @browser.goto "https://developer.paypal.com/"
    @browser.input(id: 'login_email').wait_until_present
    @browser.input(id: 'login_email').send_keys(master_credentials["email"])
    @browser.input(id: 'login_password').send_keys(master_credentials["password"])
    @browser.button(value: 'Log In').click
    @browser.a(text: 'preconfigured account').wait_until_present

    @browser.goto(url)
  end

  if @browser.button(value: 'Have a PayPal account?').present?
    @browser.button(value: 'Have a PayPal account?').click
  end


  @buyer_credentials = CREDENTIALS["paypal"]["buyer"]

  @browser.text_field(id: 'login_email').wait_until_present
  @browser.text_field(id: 'login_email').set(@buyer_credentials["email"])
  @browser.text_field(id: 'login_password').set(@buyer_credentials["password"])
  @browser.button(id: 'submitLogin').click

  @browser.checkbox(id: 'esignOpt').wait_until_present
  sleep 1
  @browser.checkbox(id: 'esignOpt').click
  @browser.button(id: 'agree').click

  @browser.button(id: 'continue_abovefold').wait_until_present
  sleep 1
  @browser.button(id: 'continue_abovefold').click

  @browser.button(name: 'merchant_return_link').wait_until_present
  sleep 1
  @browser.button(name: 'merchant_return_link').click
end

def login_with_email!
  return if @browser.div(id: 'user-nav').present?

  @bountysource_credentials = CREDENTIALS["bountysource"]

  @browser.goto "#signin/email"

  # login with email and password
  @browser.text_field(name: 'email').set(@bountysource_credentials["email"])
  @browser.text_field(name: 'password').set(@bountysource_credentials["password"])
  @browser.div(text: /Email address found/).wait_until_present
  @browser.button(value: 'Sign In').click
  @browser.div(id: 'user-nav').wait_until_present
end

def login_with_github!
  @browser.goto 'https://github.com/login' unless @browser.url.start_with?('https://github.com/login')

  if @browser.url.start_with?('https://github.com/login')
    github_credentials = CREDENTIALS["github"]
    @browser.text_field(id: 'login_field').set(github_credentials["username"])
    @browser.text_field(id: 'password').set(github_credentials["password"])
    @browser.button(value: 'Sign in').click

    # auto authorize
    @browser.button(text: 'Authorize app').click if @browser.button(text: 'Authorize app').present?
  end
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
    user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.56 Safari/537.17 Selenium'
    if ENV['RAILS_ENV'] == 'staging'
      capabilities = Selenium::WebDriver::Remote::Capabilities.chrome('chrome.switches' => ["--user-agent='#{user_agent}'"])
      $browser = Watir::Browser.new(:remote, :url => 'http://165.225.134.232:9515/', :desired_capabilities => capabilities)
    else
      $browser = Watir::Browser.new(:chrome, :switches => ["--user-agent='#{user_agent}'"])
    end

    # add a navigate method for scope.js routes
    class << $browser
      # execute javascript in the scope.js instance
      def execute_scopejs_script(src)
        execute_script "with (scope.instance) { #{src} }"
      end

      alias_method :goto_without_scope, :goto
      def goto(route)
        if !(route =~ /^#/)
          # absolute URL
          goto_without_scope(route)
        elsif url[0, BASE_URL.length] == BASE_URL
          # wait until scope is loaded and initializers have run
          Watir::Wait.until { execute_script("return (typeof(scope) != 'undefined') && scope.instance && scope.instance.initializer && (typeof(scope.__initializers) == 'undefined')") }

          # scope route and we're already on a scope page
          execute_script "scope.instance.set_route('#{route}')"
        else
          # scope route but we're not on a scope page
          goto_without_scope("#{BASE_URL}#{route}")
        end

        if BASE_URL =~ /bountysource\.dev/ && route =~ /^#/
          $browser.div(id: 'dev-bar').wait_until_present
          if $browser.div(id: 'dev-bar').a(text: API_ENDPOINT).exists?
            $browser.div(id: 'dev-bar').a(text: API_ENDPOINT).click
            $browser.div(id: 'dev-bar').b(text: API_ENDPOINT).wait_until_present
          end
        end
      end

      ## goto route.
      #def goto_route(route)
      #  puts "goto_route #{route}"
      #
      #  # set the route
      #  execute_script %(window.location.href = "#{BASE_URL}#{route}")
      #  Watir::Wait.until { execute_script %(return typeof(scope) != "undefined" && "#{route}".match(scope.current_route)) }
      #
      #  puts "finished goto_route #{route}"
      #
      #  # ensure we're using the correct API_ENDPOINT
      #  if BASE_URL =~ /bountysource\.dev/
      #    $browser.div(id: 'dev-bar').wait_until_present
      #    if $browser.div(id: 'dev-bar').a(text: API_ENDPOINT).exists?
      #      $browser.div(id: 'dev-bar').a(text: API_ENDPOINT).click
      #      $browser.div(id: 'dev-bar').b(text: API_ENDPOINT).wait_until_present
      #    end
      #  end
      #end

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
      def restore_api_method(*methods)
        methods.each do |method|
          execute_scopejs_script %(
            with (scope('BountySource')) {
              define('#{method.to_s}', _original_#{method.to_s});
              delete BountySource._original_#{method.to_s};
            }
          )
        end
      end

      # a breakpoint that halts testing until browser window clicked.
      def breakpoint!(text='Click anywhere to continue...', timeout=0)
        puts ">> breakpoint reached. click anywhere in the browser to continue"

        text = text.gsub("\"", "\\\"")

        execute_scopejs_script %(
          document.body.appendChild(div(
            {
              id: '_breakpoint_overlay',
              style: 'background-color: rgba(0, 0, 0, 0.6); position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; text-align: center;',
              onClick: function() { App.remove_element('_breakpoint_overlay'); }
            },
            p({ style: 'margin: 150px 100px; line-height: 60px; font-size: 50px; color: white; text-shadow: 3px 3px #000' }, "#{text}"))
          );
          if (#{timeout} > 0) setTimeout(function() {
            var e = document.getElementById('_breakpoint_overlay');
            e.parentNode.removeChild(e);
          }, #{timeout});
          console.log("** Breakpoint reached **");
         )

        while execute_scopejs_script("return document.getElementById('_breakpoint_overlay');") do
          sleep 0.25 # waiting a little
        end

        puts ">> continuing from breakpoint"
      end
    end
  end

  config.before(:all) do
    @browser = $browser

    login_with_github!
  end

  config.before(:each) do
    $browser.goto '#' unless $browser.url =~ /\#$/
    $browser.execute_scopejs_script "BountySource.logout();"
  end

  config.before(:each) do |test|
    if DEMO_MODE
      $browser.breakpoint!(test.example.metadata[:full_description], 4000)
    end
  end

  config.after(:suite) do
    $browser.close
  end
end