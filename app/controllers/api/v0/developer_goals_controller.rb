class Api::V0::DeveloperGoalsController < Api::V0::BaseController

  def index
    @developer_goals = DeveloperGoal.includes(:issue, :person).all
  end

end
