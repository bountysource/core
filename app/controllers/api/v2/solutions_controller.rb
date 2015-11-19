class Api::V2::SolutionsController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::DeveloperGoalsHelper

  def index
    @collection = Solution.all

    if params[:include_owner].to_bool
      @include_solution_owner = true
      @collection = @collection.includes(:person)
    end

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
  end

end
