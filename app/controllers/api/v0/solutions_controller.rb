class Api::V0::SolutionsController < Api::V0::BaseController

  def index
    @solutions = Solution.includes(:issue, :person).all
  end

end
