require 'paypal-sdk-rest'

module Api::V2::CashOutsHelper

  include Api::V2::BaseHelper
  include PayPal::SDK::REST

  def filter!(collection)
    # Filter by cash outs that have been sent
    if params.has_key? :sent
      if params[:sent].to_bool
        # Only show sent
        collection = collection.where('cash_outs.sent_at IS NOT NULL')
      else
        # Only show pending
        collection = collection.where('cash_outs.sent_at IS NULL')
      end
    end

    collection
  end

  def order!(collection)
    return collection unless params[:order]

    _collection = collection

    direction = _direction_for_order_value(params[:order])
    order_value = _strip_order_value(params[:order])

    case order_value
    when 'sent'
      _collection = _collection.reorder("sent_at #{direction}")

    when 'created'
      _collection = _collection.reorder("created_at #{direction}")
    end

    _collection
  end

  def send_paypal!()
    # select cash outs that have been approved but not sent yet
    collection = ::CashOut::Paypal
      .where('cash_outs.approved_at IS NOT NULL')
      .where('cash_outs.sent_at IS NULL')

    # map them to the structure that paypal expects
    payouts = collection.map do |cashout|
      {
        :recipient_type => 'EMAIL',
        :amount => {
          :value => cashout.amount,
          :currency => 'USD'
        },
        :note => 'Thanks!',
        :receiver => cashout.paypal_address,
        :sender_item_id => cashout.id,
      }
    end

    batch = Payout.new(
      {
        :sender_batch_header => {
          :sender_batch_id => SecureRandom.hex(8), # TODO: USE BETTER BATCH ID
          :email_subject => 'You have a Payout!', # FIXME
        },
        :items => payouts
      }
    )

    begin
      payout_batch = batch.create
      batch_id = payout_batch.batch_header.payout_batch_id

      logger.info "Created Payout: #{batch_id}"

      collection.update_all batch_id: batch_id

      payout_batch
    rescue ResourceNotFound => err
      logger.error payout.error.inspect
    end
  end

  def check_paypal_batch_status()
    # select items that have been batched but not paid out yet
    batch_ids = CashOut::Paypal
      .where('cash_outs.batch_id IS NOT NULL')
      .where('cash_outs.sent_at IS NULL')
      .uniq
      .pluck(:batch_id)

    batch_ids.each do |batch_id|
      payout_batch = Payout.get batch_id

      items = payout_batch.items.map { |item| item.payout_item.sender_item_id }

      case payout_batch.batch_header.batch_status
      when 'SUCCESS'
        ::CashOut
          .where(id: items)
          .update_all sent_at: DateTime
      when 'DENIED'
        ::CashOut
          .where(id: items)
          .update_all batch_id: nil
      end
    end
  end

end
