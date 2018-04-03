class Api::V0::TeamPayinsController < Api::V0::BaseController

  before_action :load_team_payin, only: [:show, :update]

  def index
    @team_payins = TeamPayin.limit(100).includes(:team, :person, :owner).order('created_at desc')
    @team_payins = @team_payins.where(person_id: params[:person_id]) if params[:person_id]
    @team_payins = @team_payins.where(team_id: params[:team_id]) if params[:team_id]
  end

  def show
  end

  def update
    if params[:refunded]
      @team_payin.refund!
    end
    @team_payin.reload
    render 'api/v0/team_payins/show'
  end

protected

  def load_team_payin
    @team_payin = TeamPayin.where(id: params[:id]).includes(:team, :person, :owner).first!
  end

end
