class GoogleWalletController < ApplicationController

  before_filter :require_auth, only: [:success]

  # POST back from Google for Wallet transaction
  def verify
    # Per the Wallet docs:
    # 1. Decode the JWT that's specified in the jwt parameter of the POST message.
    # 2. Check to make sure that the order is OK.
    # 3. Get the value of the JWT's "orderId" field.
    # 4. Send a 200 OK response that has only one thing in the body: the "orderId" value you got in step 3.

    if params[:jwt]
      decoded_jwt = Account::GoogleWallet.decode_jwt(params[:jwt])

      # safely check to see if the JWT was decoded correctly, and contains the orderId from Google
      order_id = decoded_jwt.try(:[], 'response').try(:[], 'orderId')

      # if the order ID is there, good to go
      if order_id
        # create the item now, followed the by transaction validation POST
        GoogleWalletItem.create(jwt: params[:jwt], order_id: order_id)

        # "...your server must send a 200 OK response where the only content
        # is the value of the "orderId" field"
        return render text: order_id, status: :ok
      end
    end

    # if we got here, something didn't line up correctly... bad request is bad
    render nothing: true, status: :bad_request
  end

  # When our frontend Wallet triggers it's success callback,
  # send the user here with the Google generated order_id. Find the
  # GoogleWalletItem model with the order_id to get redirect URL for
  # frontend receipt page. This is where we create items in the shopping
  # cart.
  def success
    require_params :order_id

    google_item = GoogleWalletItem.find_by_order_id(params[:order_id])
    order = Transaction::Order::GoogleWallet.create_from_cart_and_checkout_method(current_user.shopping_cart, Account::GoogleWallet.instance, source: google_item)
    redirect_to order.www_receipt_url, status: :moved_permanently

  rescue Transaction::Order::CartEmpty
    # If the success callback is triggered again, the cart will be empty.
    # Render error, this shouldn't happen
    render nothing: true, status: :bad_request
  end
end
