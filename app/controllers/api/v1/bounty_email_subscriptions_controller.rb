class Api::V1::BountyEmailSubscriptionsController < ApplicationController
  before_action :require_auth
  before_action :find_subscription, only: [:show, :update, :destroy]

  # GET /api/user/bounty_email_subscriptions
  def index
    @subscriptions = @person.bounty_email_subscriptions.order(created_at: :desc)
    render json: {
      bounty_email_subscriptions: @subscriptions.map { |s| serialize(s) }
    }
  end

  # POST /api/user/bounty_email_subscriptions
  def create
    @subscription = @person.bounty_email_subscriptions.build(subscription_params)
    if @subscription.save
      render json: { bounty_email_subscription: serialize(@subscription) }, status: :created
    else
      render json: { error: @subscription.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  # GET /api/user/bounty_email_subscriptions/:id
  def show
    render json: { bounty_email_subscription: serialize(@subscription) }
  end

  # PUT/PATCH /api/user/bounty_email_subscriptions/:id
  def update
    if @subscription.update(subscription_params)
      render json: { bounty_email_subscription: serialize(@subscription) }
    else
      render json: { error: @subscription.errors.full_messages.join(", ") }, status: :unprocessable_entity
    end
  end

  # DELETE /api/user/bounty_email_subscriptions/:id
  def destroy
    @subscription.destroy
    head :no_content
  end

  private

  def find_subscription
    @subscription = @person.bounty_email_subscriptions.find(params[:id])
  end

  def subscription_params
    allowed = params.permit(:name, :query, :min_amount, :tracker_name, :language, :active)
    if params[:form_data].present?
      fd = params.require(:form_data).permit(:name, :query, :search, :min_amount, :min_bounty, :tracker_name, :project, :language, :active)
      allowed[:name] ||= fd[:name]
      allowed[:query] ||= fd[:query].presence || fd[:search]
      allowed[:min_amount] ||= fd[:min_amount].presence || fd[:min_bounty]
      allowed[:tracker_name] ||= fd[:tracker_name].presence || fd[:project]
      allowed[:language] ||= fd[:language]
      allowed[:active] = fd[:active] unless fd[:active].nil?
    end
    allowed
  end

  def serialize(s)
    {
      id: s.id,
      name: s.name,
      query: s.query,
      min_amount: s.min_amount.to_f,
      tracker_name: s.tracker_name,
      language: s.language,
      active: s.active,
      last_notified_at: s.last_notified_at,
      created_at: s.created_at,
      updated_at: s.updated_at
    }
  end
end
