# == Schema Information
#
# Table name: accounts
#
#  id          :integer          not null, primary key
#  type        :string(255)      default("Account"), not null
#  description :string(255)      default(""), not null
#  currency    :string(255)      default("USD"), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  owner_id    :integer
#  owner_type  :string(255)
#  standalone  :boolean          default(FALSE)
#
# Indexes
#
#  index_accounts_on_item_id    (owner_id)
#  index_accounts_on_item_type  (owner_type)
#  index_accounts_on_type       (type)
#

class Account::GoogleWallet < Account

  ITEM_TTL = 3600 # seconds

  def self.liability?
    false
  end

  def display_name
    "Google Wallet"
  end

  # Calculate the processing fee for a given gross.
  # https://support.google.com/payments/answer/1385343?hl=en&ctx=cb&src=cb&cbid=1qnq5734nhn02&cbrank=0
  def self.compute_processing_fee(gross)
    [Money.new(gross * 100) * 0.05, Money.new(gross * 100) * 0.019 + Money.new(30)].min
  end

  def self.create_jwt(options)
    jwt_attributes = build_jwt_attributes(options)
    ::JWT.encode(jwt_attributes, Api::Application.config.google_wallet[:merchant_secret])
  end

  def self.decode_jwt(jwt)
    ::JWT.decode(jwt, Api::Application.config.google_wallet[:merchant_secret]).with_indifferent_access
  end

  def self.build_jwt_attributes(options={})
    options = options.with_indifferent_access
    now = Time.now.to_i

    # Always make gross and amount a string with two decimal places.
    price = Money.new(options[:price].to_f * 100).to_s

    # merge in default params
    attrs = {
      # Your Seller Identifier
      iss:  Api::Application.config.google_wallet[:merchant_id],

      # Must be "Google". The "aud" field is a standard JWT field that identifies the target audience for the JWT.
      aud:  'Google',

      # The type of request. Must be "google/payments/inapp/item/v1". This is a standard JWT field.
      # type: 'google/payments/inapp/item/v1',
      typ: 'google/payments/inapp/item/v1',

      # The time when the purchase will expire, specified in seconds since the epoch. This is a standard JWT field.
      exp:  (now + ITEM_TTL).to_s,

      # The time when the JWT was issued, specified in seconds since the epoch. This is a standard JWT field.
      iat:  now.to_s,

      # The item being purchased. See the following table for details.
      request: {
        # The name of the item. This name is displayed prominently in the purchase flow UI and can have no
        # more than 50 characters.
        name: options[:name] || '',

        # Optional: Text that describes the item. This description is displayed in the purchase flow UI and
        # can have no more than 100 characters.
        description: options[:description] || '',

        # Optional: Data to be passed to your success and failure callbacks. The string can have no more than 200 characters.
        # You might want to include something that lets you identify the buyer. Examples of other information you might
        # include are a promotion identifier or a SKU #.
        sellerData: options[:seller_data] || '',

        # The purchase price of the item, with up to 2 decimal places.
        price: (price || '').to_s, # NOTE ensure that it's a string...

        # A 3-character currency code that defines the billing currency. Google will automatically convert the
        # billing currency to the currency of your merchant account. The currently supported currencies
        # are USD, EUR, CAD, GBP, AUD, HKD, JPY, DKK, NOK, SEK.
        currencyCode: 'USD'
      }
    }

    # stringify everything!
    JSON.parse(attrs.to_json)
  end

end
