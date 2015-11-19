class Api::V0::ShortsController < Api::V0::BaseController

  before_filter :require_short, only: [:show, :update]

  def index
    @items = Short.all
    render "api/v0/shorts/index"
  end

  def show
    render "api/v0/shorts/show"
  end

  def create
    @item = Short.create!(short_params)
    render "api/v0/shorts/show"
  rescue ActiveRecord::RecordInvalid => exception
    render json: { error: exception.record.errors.full_messages.to_sentence }, status: :unprocessable_entity
  end

  def update
    @item.update_attributes(short_params)
    render "api/v0/shorts/show"
  rescue ActiveRecord::RecordInvalid => exception
    render json: { error: exception.record.errors.full_messages.to_sentence }, status: :unprocessable_entity
  end

protected

  def require_short
    @item = Short.where(id: params[:id]).first!
  end

  def short_params
    params.permit(:slug, :destination)
  end

end
