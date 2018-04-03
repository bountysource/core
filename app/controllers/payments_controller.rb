class PaymentsController < ApplicationController

  # Endpoint for paypal IPN postback server
  def paypal_ipn
    # save notification
    @notification = PaymentNotification::Paypal.process_raw_post(request.raw_post)

    # process order using high-priority delayed job
    @notification.delay(priority: 0).process_order

    # return happy status to paypal
    head :ok
  end

  # Where the user ends up after a successful payment (POST with IPN data including txn_id)
  def paypal_return
    if params[:txn_id]
      # save notification
      @notification = PaymentNotification::Paypal.process_raw_post(request.raw_post)

      # find or create order
      @order = @notification.process_order

      # redirect
      redirect_to @order.www_receipt_url

    elsif @notification.blank?
      # when would this happen? perhaps we should clear the cart? perhaps we should raise?
      redirect_to Api::Application.config.www_receipts_url
    end
  end

end
