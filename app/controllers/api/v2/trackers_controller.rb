class Api::V2::TrackersController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::TrackersHelper

  after_action log_activity(Tracker::Event::VIEW), only: [:show]

  before_action :parse_boolean_values

  def index
    #build includes values for query
    includes = []
    includes << :team if @include_tracker_team

    @collection = ::Tracker.not_deleted

    if includes.length > 0
      @collection = @collection.includes(includes)
    end

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
  end

  def show
    includes = []
    @item = ::Tracker.find_with_merge(params[:id], include: includes)
    @item.remote_sync_if_necessary(state: "open", person: current_user)
  end

protected

  def parse_boolean_values
    @include_tracker_description = params[:include_description].to_bool
    @include_tracker_team = params[:include_team].to_bool
    @include_tracker_issue_stats = params[:include_issue_stats].to_bool
    @include_tracker_team_bounty_stats = params[:include_team_bounty_stats].to_bool
  end
end
