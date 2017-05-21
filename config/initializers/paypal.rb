PayPal::SDK.configure(
  :mode => ENV['PAYPAL_SANDBOX']=='true' ? 'sandbox' : 'live', # "sandbox" or "live"
  :client_id => ENV['PAYPAL_CLIENT_ID'],
  :client_secret => ENV['PAYPAL_CLIENT_SECRET'],
  :ssl_options => { } )
PayPal::SDK.logger = Rails.logger
