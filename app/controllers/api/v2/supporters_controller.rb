class Api::V2::SupportersController < Api::BaseController

  include Api::V2::PaginationHelper

  def index
    @team = Team.where(slug: params[:team_slug]).first!

    # compute page size
    values = {
      page: params.has_key?(:page) ? params[:page].to_i : 1, 
      per_page: params.has_key?(:per_page) ? params[:per_page].to_i : 100,
      offset: 0, 
      order: params[:order],
    }
    values[:offset] = (values[:page] - 1) * values[:per_page] if values[:page] > 1

    @collection = @team.top_supporters(values)

    render 'api/v2/supporters/index'
  end

end
