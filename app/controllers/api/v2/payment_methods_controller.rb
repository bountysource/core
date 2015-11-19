class Api::V2::PaymentMethodsController < Api::BaseController

  before_filter :require_auth

  def index
    @collection = current_user.payment_methods
    render 'api/v2/payment_methods/index'
  end
end
