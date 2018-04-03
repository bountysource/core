class Api::V2::StatsController < Api::BaseController

  #before_action :whitelist_access, only: :index

  def index
    @item = PublicStat.singleton
    render json: [
      @item.daily,
      @item.weekly,
      @item.monthly,
      @item.quarterly
    ]
  end

protected

  def whitelist_access
    allowed_person_ids = [5,7]
    render json: { error: 'Access not allowed' }, status: :not_found unless allowed_person_ids.include?(current_user.try(:id))
  end

end
