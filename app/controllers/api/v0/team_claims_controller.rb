class Api::V0::TeamClaimsController < Api::V0::BaseController

  before_action :require_team_claim, only: [:update]

  def index
    @team_claims = TeamClaim.where(accepted_at: nil, rejected_at: nil).order(:created_at).includes(:team, :person => :github_account)
  end

  def update
    raise "already accepted/rejected" if @team_claim.accepted_at || @team_claim.rejected_at

    if params[:accepted]
      @team_claim.update_attributes!(accepted_at: Time.now)
      @team_claim.team.claim_team(@team_claim.person)
    elsif params[:rejected]
      @team_claim.update_attributes(rejected_at: Time.now, rejected_notes: params[:rejected_notes])
      @team_claim.person.send_email(:claim_team_rejected, team: @team_claim.team, team_claim: @team_claim)
    end

    render json: true
  end

protected

  def require_team_claim
    @team_claim = TeamClaim.where(id: params[:id]).first!
  end

end
