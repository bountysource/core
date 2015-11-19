class Api::V2::BountyClaimsController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::BountyClaimsHelper

  def index
    @collection = ::BountyClaim

    if params[:include_owner].to_bool
      @include_bounty_claim_owner = true
      @collection = @collection.includes(:person)
    end

    if params[:include_issue].to_bool
      @include_bounty_claim_issue = true
      @collection = @collection.includes(:issue)
    end

    if params[:include_responses].to_bool
      @include_bounty_claim_responses = true
      @include_bounty_claim_response_owner = true
      @collection = @collection.includes(:bounty_claim_responses)
    end

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
  end

  def show
    @item = ::BountyClaim.find params[:id]
  end

end
