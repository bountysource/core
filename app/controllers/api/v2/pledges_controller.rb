class Api::V2::PledgesController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::PledgesHelper

  def index
    @collection = ::Pledge.all

    if params[:include_owner].to_bool
      @include_owner = true
      @collection = @collection.includes(:owner, :person)
    end

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
  end

end
