class Api::V2::SupportOfferingRewardsController < Api::BaseController

  before_action :require_auth

  def create
    @team = Team.find_by(slug: params[:team_id])
    if is_team_admin?
      @team.support_offering.rewards.create!(support_offering_reward_params)
      head :no_content
    else
      head :unauthorized
    end
  end

  def update
    @support_offering_reward = SupportOfferingReward.find(params[:id])
    @team = @support_offering_reward.support_offering.team

    if is_team_admin?
      if @support_offering_reward.update(support_offering_reward_params)
        head :no_content
      else
        render json: { errors: @support_offering_reward.errors.full_messages }, status: :bad_request
      end
    else
      head :unauthorized
    end
  end

  def destroy
    @support_offering_reward = SupportOfferingReward.find(params[:id])
    @team = @support_offering_reward.support_offering.team

    if is_team_admin?
      @support_offering_reward.mark_as_deleted!
    else
      head :unauthorized
    end
  end

  private

    def support_offering_reward_params
      params.require(:support_offering_reward).permit(:title, :description, :amount)
    end

    def is_team_admin?
      @team.person_is_admin?(current_user)
    end
end