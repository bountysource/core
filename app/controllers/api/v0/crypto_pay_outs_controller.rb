class Api::V0::CryptoPayOutsController < Api::V0::BaseController

  include Api::V2::PaginationHelper

  def index
    @crypto_pay_outs = CryptoPayOut.includes(:person).pending_approval.order('created_at asc')
    @crypto_pay_outs = paginate!(@crypto_pay_outs)
    
    render 'api/v0/crypto_pay_outs/index'
  end
end