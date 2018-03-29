class Api::V1::RewardsController < ApplicationController

  before_action :require_fundraiser
  before_action :require_fundraiser_ownership,  except: [:show, :index]
  before_action :require_reward,                except: [:index, :create]

  def index
    @rewards = @fundraiser.rewards.order('rewards.amount asc')
    render "api/v1/rewards/index"
  end

  def show
    render "api/v1/rewards/show"
  end

  def create
    require_params :amount, :description

    @reward = @fundraiser.rewards.create(reward_params)
    render "api/v1/rewards/show", status: :created
  end

  def destroy
    if @reward.destroy
      render json: {}, status: :no_content
    else
      render json: { error: @reward.errors.full_messages.join(', ') }, status: :bad_request
    end
  end

  def update
    @reward.description           = params[:description]            || @reward.description
    @reward.limited_to            = params[:limited_to]             || @reward.limited_to
    @reward.fulfillment_details   = params[:fulfillment_details]    || @reward.fulfillment_details
    @reward.amount = Monetize.parse(params[:amount]).amount.to_i if params[:amount]

    if @reward.valid? && @reward.save
      render "api/v1/rewards/show"
    else
      render json: { error: @reward.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

protected

  def require_fundraiser
    unless (@fundraiser = Fundraiser.find_by_id params[:fundraiser_id])
      render json: { error: "Fundraiser not found" }, status: :not_found
    end
  end

  def require_fundraiser_ownership
    require_fundraiser unless @fundraiser
    find_person unless @person
    unless @fundraiser.person == @person || @person.try(:admin?)
      render json: { error: "Fundraiser not found" }, status: :not_found
    end
  end

  def require_reward
    require_fundraiser unless @fundraiser
    unless (@reward = @fundraiser.rewards.find_by_id params[:id])
      render json: { error: "Reward not found" }, status: :not_found
    end
  end

  def reward_params
    params.permit(:amount, :description, :limited_to, :fulfillment_details)
  end
end
