class Api::V2::ReportsController < Api::BaseController
  before_action :require_auth, only: [:create]
  before_action :set_item, only: [:show, :update]

  def index
    @collection = Report.includes(:reporter).recent
    @collection = @collection.by_status(params[:status]) if params[:status]
    @collection = @collection.where(target_type: params[:target_type]) if params[:target_type]
    @collection = @collection.page(params[:page]).per(50)
  end

  def show
  end

  def create
    require_params :target_type, :target_id

    @item = Report.new(
      reporter: current_user,
      target_type: params[:target_type],
      target_id: params[:target_id],
      reason: params[:reason] || 'spam',
      description: params[:description]
    )

    @item.save!
    render :show
  end

  def update
    # Only admins can update report status
    require_auth

    unless current_user.admin?
      raise CanCan::AccessDenied
    end

    @item.update!(update_params)
    render :show
  end

private

  def set_item
    @item = Report.find(params[:id])
  end

  def update_params
    params.permit(:status, :description)
  end
end
