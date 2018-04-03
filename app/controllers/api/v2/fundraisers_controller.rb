class Api::V2::FundraisersController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::FundraisersHelper

  before_action :parse_boolean_values

  def index
    @collection = ::Fundraiser.all

    # Keep unplublished fundraisers if the person is admin requesting on behalf of a team (For manging team's fundraisers)
    @collection = ::Fundraiser.where(published: true) unless can?(:modify_team_members, Team.find_by(id: params[:team_id]))

    # Includes owner if person node added\
    @collection = @collection.includes(:person) if @include_owner

    # Include rewards
    @collection.includes(:rewards) if @include_rewards

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
  end

  def show
    includes = []
    @item = Fundraiser.find params[:id], include: includes
  end

protected

  def parse_boolean_values
    @include_description = params[:include_description].to_bool
    @include_description_html = params[:include_description_html].to_bool
    @include_owner = params[:include_owner].to_bool
    @include_rewards = params[:include_rewards].to_bool
  end

end
