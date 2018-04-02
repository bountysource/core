class Api::V0::BountyClaimsController < Api::V0::BaseController
  before_action :require_bounty_claim, only: [:show, :update]

  def index
    @bounty_claims = BountyClaim.order("created_at desc")
    render "api/v1/bounty_claims/index"
  end

  def show
    render "api/v1/bounty_claims/show"
  end

  def update
    @bounty_claim.code_url = params[:code_url] if params.has_key?(:code_url)
    @bounty_claim.description = params[:description] if params.has_key?(:description)
    @bounty_claim.disputed = params[:disputed] if params.has_key?(:disputed)
    @bounty_claim.rejected = params[:rejected] if params.has_key?(:rejected)

    if @bounty_claim.save
      render "api/v1/bounty_claims/show"
    else
      render json: { error: @bounty_claim.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def contested
    # terrible query, oh well it's admin
    @bounty_claims = BountyClaim.all.select(&:contested?)
    render "api/v1/bounty_claims/index"
  end

protected

  def require_bounty_claim
    unless (@bounty_claim = BountyClaim.find(params[:id]))
      render json: { error: "Bounty claim not found" }, status: :not_found
    end
  end
end
