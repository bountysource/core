class Api::V1::BountiesController < ApplicationController
  before_action :require_auth, except: [:info]
  before_action :require_bounty, except: [:index, :info]

  # Get all bounties that the authenticated user has placed on Github issues
  def index
    @bounties = @person.bounties
  end

  # Show a bounty placed by the authenticated user
  def show
    render "api/v1/bounties/show"
  end

  def update
    @bounty.anonymous = params[:anonymous].to_bool if params.has_key? :anonymous

    if @bounty.save
      render "api/v1/bounties/show"
    else
      render json: { error: @bounty.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def info
    render json: Bounty.info
  end

protected

  def require_bounty
    unless (@bounty = @person.bounties.find_by_id(params[:id]))
      render json: { error: "Bounty not found" }, status: :not_found
    end
  end
end
