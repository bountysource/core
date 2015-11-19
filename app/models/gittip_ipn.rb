# == Schema Information
#
# Table name: gittip_ipns
#
#  id             :integer          not null, primary key
#  txn_id         :string(255)      not null
#  raw_post       :text             not null
#  transaction_id :integer
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#
# Indexes
#
#  index_gittip_ipns_on_txn_id  (txn_id) UNIQUE
#

class GittipIpn < ActiveRecord::Base
  attr_accessible :txn_id, :raw_post, :transaction

  belongs_to :transaction

  class Error < RuntimeError; end

  def self.process_payment_params(gittip_account, payment_options)
    begin
      item = Transaction.new_item_from_number(payment_options[:item_number])
    rescue ActiveRecord::RecordNotFound => e
      return { error: e.message , status: :not_found }
    end

    # require a gittip account to be present
    unless gittip_account
      return { error: 'Gittip account not found.', status: :not_found }
    end

    item.amount = payment_options[:amount]
    item.person = payment_options[:person]
    return { error: item.errors.full_messages.join(', '), status: :unprocessable_entity } unless item.valid?

    # compile a redirect URL and send them through paypal checkout
    return {
      redirect_url: generate_checkout_url(gittip_account,
        access_token: gittip_account.oauth_token,
        item_name: item.item_name,
        item_number: payment_options[:item_number],
        amount: item.amount,
        cancel_url: payment_options[:cancel_url],
        success_url: payment_options[:success_url]
      )
    }
  end

  # Note: request a Gittip linked account
  def self.find_or_create_from_raw_post(raw_post)
    params = Rack::Utils.parse_nested_query(raw_post)

    ipn = find(:first, conditions: { txn_id: params['txn_id'] })
    ipn = nil unless ipn.try(:transaction).try(:item)
    ipn ||= begin
      # find linked account from params
      gittip_account = LinkedAccount::Gittip.find_via_access_token params['access_token']

      # raise if account not found from access token
      raise Error, "Gittip account not found" unless gittip_account

      # verify with gittip or raise an exception
      response = gittip_account.api('/on/bountysource/verify-transfer.json',
        params: params.select { |k,_| %w(txn_id amount item_number).include? k.to_s }
      )

      if response.ok?
        # update the gittip account balance cache while we're at it!
        gittip_account.delay.remote_sync

        create_ipn_and_transaction raw_post, gittip_account, params['txn_id']
      else
        raise Error, "invalid transaction"
      end
    end

    return ipn
  end

  def self.create_ipn_and_transaction(raw_post, gittip_account, txn_id)
    params = Rack::Utils.parse_nested_query(raw_post)

    begin
      ipn = create!(raw_post: raw_post, txn_id: txn_id)
    rescue ActiveRecord::RecordNotUnique
      # it's possible IPN came in and was created when we were verifying with gittip... if so, just return the other object
      return find(:first, conditions: { txn_id: txn_id })
    end

    # shortcuts
    money_gross = Money.new(params['amount'].to_f*100, 'USD')
    money_fee = Money.new(params['fee'].to_f*100, 'USD')
    money_net = money_gross - money_fee

    # create a Pledge or Bounty object (money_gross to advertise full amount but money_net is what is actually available)
    item = Transaction.new_item_from_number(params['item_number'])
    item.amount = money_gross
    item.person = gittip_account.person
    item.save!

    # create actual transfer (money_net, not money_gross)
    transaction = Transaction.build do |tr|
      tr.description = "From Gittip (txn_id: #{ipn.txn_id} gross: #{money_gross.display_amount} fee: #{money_fee.display_amount})"
      tr.splits.create([
        { amount: -money_net, account:  Account::Gittip.instance },
        { amount: money_net,  item: item }
      ])
    end

    ipn.update_attributes transaction: transaction

    return ipn
  end

  # substitutes item_id in redirect url with valid receipt url
  def get_redirect_url
    params[:success_url].gsub(":item_id", "#{transaction.splits.map(&:item).compact.first.id}")
  end

  def params
    @params ||= Rack::Utils.parse_nested_query(raw_post).with_indifferent_access
  end

protected

  # generate URL for checkout at Gittip
  def self.generate_checkout_url(gittip_account, options)
    "#{Api::Application.config.gittip_host}on/bountysource/authorize-payment.html?#{options.to_param}"
  end

end
