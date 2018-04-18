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
    # verify transaction thru pdt method
    response = pdt_post_request
    
    # save notification
    response.gsub!("\n", "&")
    @notification = PaymentNotification::Paypal.process_raw_post(response)

    # process order
    @notification.process_order

    # redirect_to order page
    redirect_to Api::Application.config.www_receipts_url
  end
private
  def pdt_post_request
    url = ENV['PAYPAL_SANDBOX'] == 'true' ? 'https://www.sandbox.paypal.com/cgi-bin/webscr' : 'https://www.paypal.com/cgi-bin/webscr'
    params = {
      cmd: '_notify-synch',
      tx: request.params[:tx],
      at: ENV['PAYPAL_PDT_TOKEN']
    }
    return RestClient.post url, params
  end
end
