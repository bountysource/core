class Api::V1::BountyClaimResponsesController < ApplicationController

  before_action :require_auth
  before_action :require_bounty_claim

  def accept
    response = @bounty_claim.accept!(@person, params[:description])
    render "api/v1/bounty_claims/show", status: response ? :ok : :bad_request
  end

  def reject
    require_params :description

    response = @bounty_claim.reject!(@person, params[:description])
    render "api/v1/bounty_claims/show", status: response ? :ok : :bad_request
  end

  def resolve
    require_params :description

    response = @bounty_claim.resolve!(@person, params[:description])
    render "api/v1/bounty_claims/show", status: response ? :ok : :bad_request
  end

  def reset
    response = @bounty_claim.reset!(@person, params[:description])
    render "api/v1/bounty_claims/show", status: response ? :ok : :bad_request
  end

protected

  def require_bounty_claim
    unless (@bounty_claim = BountyClaim.find_by_id params[:id])
      render json: { error: "Bounty claim not found" }, status: :not_found
    end
  end
end
