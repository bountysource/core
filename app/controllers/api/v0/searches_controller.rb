class Api::V0::SearchesController < Api::V0::BaseController
  def index
    @searches = Search.general.includes(:person).order('created_at desc')
    render "api/v1/searches/index"
  end

  def bounty
    @searches = Search.bounty.includes(:person).order('created_at desc')
    render "api/v1/searches/index"
  end

  def popular
    render json: Search.general.group(:query).order('count(query) desc').limit(50).count.to_a
  end
end
