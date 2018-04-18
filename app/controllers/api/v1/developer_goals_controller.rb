class Api::V1::DeveloperGoalsController < ApplicationController
  
  before_action :require_auth, only: [:create, :update, :show, :destroy]
  before_action require_issue(:id)
  before_action :require_developer_goals, only: [:update, :show, :destroy]
  
  after_action log_activity(Issue::Event::SET_DEVELOPER_GOAL), only: [:create]
  after_action log_activity(Issue::Event::UPDATE_DEVELOPER_GOAL), only: [:update]
  after_action log_activity(Issue::Event::DESTROY_DEVELOPER_GOAL), only: [:destroy]

  def create
    require_params :amount
    
    if (@developer_goal = @issue.developer_goals.where(person_id: @person.id).first)
      render "api/v1/developer_goals/show", status: :not_modified
    else
      params[:amount] = convert_currency_if_necessary(params)
      @developer_goal = @issue.developer_goals.create(person: @person, amount: params[:amount])

      if @developer_goal.errors.empty?
        render "api/v1/developer_goals/show", status: :created
      else
        render json: { error: @developer_goal.errors.full_messages.to_sentence }, status: :unprocessable_entity
      end
    end
  end

  def index
    @developer_goals = @issue.developer_goals
  end

  def update
    params[:amount] = convert_currency_if_necessary(params)    
    @developer_goal.amount = params[:amount] if params.has_key?(:amount)

    if @developer_goal.save
      render "api/v1/developer_goals/show"
    else
      render json: { error: @developer_goal.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def show
  end

  def destroy
    if @developer_goal.destroy
      head :ok
    else
      render json: { error: @developer_goal.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

protected

  def require_developer_goals
    unless (@developer_goal = @issue.developer_goals.where(person_id: @person.id).first)
      render json: { error: "Developer goal not found" }, status: :not_found
    end
  end

  def convert_currency_if_necessary(params)
    currency = params[:currency] || "USD"
    amount = params[:amount]

    if currency == "BTC"
      amount = Currency.btc_to_usd(amount)
    end
    amount
  end

end
