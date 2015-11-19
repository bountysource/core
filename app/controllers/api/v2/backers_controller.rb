class Api::V2::BackersController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::BackersHelper

  def index
    @collection = top_backers(params)
  end

end
