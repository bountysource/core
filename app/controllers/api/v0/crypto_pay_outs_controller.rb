class Api::V0::CryptoPayOutsController < Api::V0::BaseController

  include Api::V2::PaginationHelper

  def index
    @crypto_pay_outs = CryptoPayOutsQuery.new
      .filter_by_state(params[:state])
      .ordered_by_latest
      .relation
      .includes(:person)
      .includes(:crypto_pay_out_txns)
      

    @crypto_pay_outs = paginate!(@crypto_pay_outs)
    
    render 'api/v0/crypto_pay_outs/index'
  end
end