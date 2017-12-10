require File.expand_path('../boot', __FILE__)

require 'rails/all'

if defined?(Bundler)
  # If you precompile assets before deploying to production, use this line
  Bundler.require(*Rails.groups(:assets => %w(development test)))
  # If you want your assets lazily compiled in production, use this line
  # Bundler.require(:default, :assets, Rails.env)
end

module Api
  class Application < Rails::Application

    # All times should be in UTC
    ENV['TZ'] = 'UTC'
    config.time_zone = 'UTC'
    config.active_record.default_timezone = :utc

    # Settings specified here will take precedence over those in config/application.rb
    config.api_url  = ENV['BOUNTYSOURCE_API_URL']
    config.www_url  = ENV['BOUNTYSOURCE_WWW_URL']
    config.short_url = ENV['BOUNTYSOURCE_SHORT_URL']
    config.salt_url = ENV['BOUNTYSOURCE_SALT_URL']

    # where you are redirected to on payment success
    config.www_receipt_url = "#{config.www_url}orders/%d"
    config.www_receipts_url = "#{config.www_url}orders"

    config.middleware.swap Rack::MethodOverride, "GetMethodOverride"

    config.middleware.use Rack::Deflater

    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.

    # Custom directories with classes and modules you want to be autoloadable.
    config.autoload_paths += %W(#{config.root}/linked_account #{config.root}/person_relation #{config.root}/lib/modules)

    # Only load the plugins named here, in the order given (default is alphabetical).
    # :all can be used as a placeholder for all plugins not explicitly named.
    # config.plugins = [ :exception_notification, :ssl_requirement, :all ]

    # Activate observers that should always be running.
    # config.active_record.observers = :cacher, :garbage_collector, :forum_observer

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    # config.time_zone = 'Central Time (US & Canada)'

    # The default locale is :en and all translations from config/locales/*.rb,yml are auto loaded.
    # config.i18n.load_path += Dir[Rails.root.join('my', 'locales', '*.{rb,yml}').to_s]
    # config.i18n.default_locale = :de

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Bountysource API secret and Admin Secret
    config.admin_secret = ENV['BOUNTYSOURCE_ADMIN_SECRET']
    config.team_invite_secret = ENV['BOUNTYSOURCE_TEAM_INVITE_SECRET']
    config.person_hash_secret = ENV['BOUNTYSOURCE_PERSON_HASH_SECRET']
    config.access_token_secret = ENV['BOUNTYSOURCE_ACCESS_TOKEN_SECRET']
    config.linked_account_secret = ENV['BOUNTYSOURCE_LINKED_ACCOUNT_SECRET']
    config.unsubscribe_secret = ENV['BOUNTYSOURCE_UNSUBSCRIBE_SECRET']

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += [:password, :admin_secret, :access_token]

    # Enable escaping HTML in JSON.
    config.active_support.escape_html_entities_in_json = true

    # Use SQL instead of Active Record's schema dumper when creating the database.
    # This is necessary if your schema can't be completely dumped by the schema dumper,
    # like if you have constraints or database-specific column types
    # config.active_record.schema_format = :sql

    # Enforce whitelist mode for mass assignment.
    # This will create an empty whitelist of attributes available for mass-assignment for all models
    # in your app. As such, your models will need to explicitly whitelist or blacklist accessible
    # parameters by using an attr_accessible or attr_protected declaration.
    config.active_record.whitelist_attributes = true
    config.active_record.mass_assignment_sanitizer = :strict

    # Enable the asset pipeline
    config.assets.enabled = true

    # Don't generate assets with `rails generate`
    config.generators.stylesheets = false
    config.generators.javascripts = false

    # Version of your assets, change this if you want to expire all your assets
    config.assets.version = '1.0'

    # SendGrid settings
    config.action_mailer.smtp_settings = {
      user_name: ENV['SMTP_USERNAME'],
      password: ENV['SMTP_PASSWORD'],
      domain: ENV['SMTP_DOMAIN'],
      address: ENV['SMTP_HOST'],
      port: ENV['SMTP_PORT'].to_i,
      authentication: :plain,
      enable_starttls_auto: true
    }

    # BountySource payout fees
    # TODO is legacy? can remove?!
    config.bountysource_tax = 0.10

    # Cookies
    config.secret_token = ENV['COOKIE_SECRET_TOKEN']
    config.secret_key_base = ENV['COOKIE_SECRET_KEY_BASE']

    # Gravatar host
    config.gravatar_host = 'https://secure.gravatar.com/'

    # Dispute period length
    config.dispute_period_length = 2.weeks

    # Define constants for GitHub API
    config.github = OpenStruct.new(
      max_body_length: 65535
    )

    config.chrome_user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.153 Safari/537.36'

    config.cash_out_fee_percentage = 0.10
    config.new_fee_structure_enacted_at = DateTime.parse '2014-04-18T18:51:03+00:00'

    # Coinbase
    config.coinbase_secret = ENV['COINBASE_SECRET']
    config.coinbase = {
      api_key: ENV['COINBASE_API_KEY'],
      api_secret: ENV['COINBASE_API_SECRET'],
      callback_url: "#{config.api_url}payments/coinbase/callback"
    }

    # GitHub App
    config.github_api = {
      client_id:      ENV['GITHUB_CLIENT_ID'],
      client_secret:  ENV['GITHUB_CLIENT_SECRET']
    }

    # Facebook App
    config.facebook_app = {
      id:     ENV['FACEBOOK_APP_ID'].to_i,
      secret: ENV['FACEBOOK_APP_SECRET']
    }

    # Twitter App
    config.twitter_app = {
      id:                          ENV['TWITTER_APP_ID'],
      secret:                      ENV['TWITTER_APP_SECRET'],
      bountysource_oauth_token:    ENV['TWITTER_APP_OAUTH_TOKEN'],
      bountysource_oauth_secret:   ENV['TWITTER_APP_OAUTH_SECRET']
    }

    # Settings for PayPal IPN
    config.paypal = {
      email: ENV['PAYPAL_EMAIL'],
      api_username: ENV['PAYPAL_API_USERNAME'],
      api_password: ENV['PAYPAL_API_PASSWORD'],
      api_signature: ENV['PAYPAL_API_SIGNATURE'],
      notify_url: "#{config.api_url}payments/paypal_ipn",
      return_url: "#{config.api_url}payments/paypal_return",
      checkout_url: ENV['PAYPAL_SANDBOX']=='true' ? 'https://www.sandbox.paypal.com/' : 'https://www.paypal.com/',
      api_url: ENV['PAYPAL_SANDBOX']=='true' ? 'https://api-3t.sandbox.paypal.com/nvp' : 'https://api-3t.paypal.com/nvp'
    }

    # Google Wallet (LEGACY)
    config.google_wallet = {
      merchant_id: ENV['GOOGLE_WALLET_MERCHANT_ID'],
      merchant_secret: ENV['GOOGLE_WALLET_MERCHANT_SECRET']
    }

    # Mixpanel
    config.mixpanel_token = ENV['MIXPANEL_TOKEN']
  end
end
