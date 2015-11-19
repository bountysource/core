class Api::V1::PledgesController < ApplicationController
  respond_to :json

  before_filter :require_auth,        only: [:update, :show]
  before_filter :require_pledge,      only: [:show, :update]
  before_filter :require_fundraiser,  only: [:index]

  def index
    @pledges = @fundraiser.pledges.includes(:owner, :person, :reward).order('amount desc')
    render "api/v1/pledges/index"
  end

  def show
  end

  def update
    @pledge.survey_response = params[:survey_response] if params[:survey_response].present?
    @pledge.anonymous = params[:anonymous].to_bool if params.has_key? :anonymous

    if params.has_key?(:reward_id)
      reward = @pledge.fundraiser.rewards.find_by_id(params[:reward_id])

      if @pledge.amount >= reward.amount
        @pledge.reward = reward
      end
    end

    if @pledge.valid?
      @pledge.save
      render "api/v1/pledges/show"
    else
      render json: { error: @pledge.errors.full_messages.join(',') }, status: :unprocessable_entity
    end
  end

protected

  def require_fundraiser
    unless (@fundraiser = Fundraiser.find_by_id params[:fundraiser_id])
      render json: { error: 'Fundraiser not found' }, status: :not_found
    end
  end

  def require_pledge
    unless (@pledge = @person.pledges.find_by_id(params[:id]))
      render json: { error: 'Pledge not found' }, status: :not_found
    end
  end

  def require_reward
    require_pledge unless @pledge
    unless (@reward = @pledge.reward)
      render json: { error: 'Reward not found' }, status: :not_found
    end
  end
end
