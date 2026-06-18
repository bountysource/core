class Api::V2::BountySubscriptionsController < Api::BaseController
  include Api::V2::PaginationHelper
  include Api::V2::BaseHelper

  before_action :require_auth
  before_action :load_subscription, only: [:show, :update, :destroy]

  def index
    @collection = current_user.bounty_subscriptions
    @collection = paginate!(@collection)
  end

  def show
  end

  def create
    @item = current_user.bounty_subscriptions.new(subscription_params)
    @item.email = current_user.email if @item.email.blank?

    if @item.save
      render 'show', status: :created
    else
      render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @item.update(subscription_params)
      render 'show', status: :ok
    else
      render json: { errors: @item.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @item.destroy
    render json: { success: true }
  end

protected

  def load_subscription
    @item = current_user.bounty_subscriptions.find(params[:id])
  end

  def subscription_params
    params.permit(
      :email, :keywords, :min_bounty_amount, :language,
      :tracker_id, :frequency, :active
    )
  end
end
