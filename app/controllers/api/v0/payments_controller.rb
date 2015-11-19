class Api::V0::PaymentsController < Api::V0::BaseController

  def recent_paypal_ipns
    @paypal_ipns = PaypalIpn.order('created_at desc')
    render "api/v1/paypal_ipns/index"
  end

end
