class Api::V0::AdvertsController < Api::V0::BaseController
  before_action :require_admin, except: :show
  def index
    @ad_spaces = AdSpace.all
    render "api/v0/ad_spaces/index"
  end

  def create
    @ad_space = AdSpace.new(ad_space_params)
    if @ad_space.save
      render "api/v0/ad_spaces/show", status: 201
    else
      render json: { error: @ad_space.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def show
    @ad_space = AdSpace.find(params[:id])
    render "api/v0/ad_spaces/show"
  end

  def update
    @ad_space = AdSpace.find(params[:id])

    if @ad_space.update(ad_space_params)
      render "api/v0/ad_spaces/show", status: 201
    else
      render json: { error: @ad_space.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @ad_space = AdSpace.find(params[:id])

    @ad_space.destroy

    head :ok
  end

  private
    def ad_space_params
      params.permit(:title, :text, :button_text, :button_url, :image_url, :position)
    end
end