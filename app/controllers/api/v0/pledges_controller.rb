class Api::V0::PledgesController < Api::V0::BaseController

  def index
    @pledges = Pledge.order('created_at desc').limit(100)
    render "api/v0/pledges/index"
  end

  def show
    @pledge = Pledge.find(params[:id])
    render "api/v0/pledges/show"
  end

end