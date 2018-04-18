class Api::V1::BountyClaimsController < ApplicationController

  before_action :require_auth, except: [:show]
  before_action :require_issue, only: [:create]
  before_action :require_bounty_claim, except: [:index, :create]
  before_action :require_ownership, only: [:update, :destroy]

  after_action log_activity(Issue::Event::BOUNTY_CLAIM), only: [:create]


  # show the authenticated users's bounty claims
  def index
    @bounty_claims = @person.bounty_claims
  end

  def show
  end

  def create
    require_params :issue_id

    amount = @issue.bounties.where(status: Bounty::Status::ACTIVE).sum(:amount)

    @bounty_claim = @person.bounty_claims.create(
      issue: @issue,
      code_url: params[:code_url],
      description: params[:description],
      amount: amount
    )

    if @bounty_claim.valid?
      render "api/v1/bounty_claims/show", status: :created
    else
      render json: { error: @bounty_claim.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def update
    @bounty_claim.code_url = params[:code_url] if params.has_key?(:code_url)
    @bounty_claim.description = params[:description] if params.has_key?(:description)

    if @bounty_claim.save
      render "api/v1/bounty_claims/show"
    else
      render json: { error: @bounty_claim.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def destroy
    if @bounty_claim.destroy
      head :no_content
    else
      head :bad_request
    end
  end

protected

  def require_bounty_claim
    unless (@bounty_claim = BountyClaim.find_by_id params[:id])
      render json: { error: "Bounty claim not found" }, status: :not_found
    end
  end

  def require_ownership
    unless @person.id == @bounty_claim.person_id
      render json: { error: "Not allowed" }, status: :unauthorized
    end
  end

  def require_issue
    unless (@issue = Issue.find_by_id params[:issue_id])
      render json: { error: "Issue not found" }, status: :not_found
    end
  end
end
