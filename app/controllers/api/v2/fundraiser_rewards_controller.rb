class Api::V2::FundraiserRewardsController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::FundraiserRewardsHelper

  def index
    @collection = ::Reward.all

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
  end

end
