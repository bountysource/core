class Api::V2::PluginsController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::PluginsHelper

  before_action :parse_boolean_values

  def index
    @collection = ::TrackerPlugin.where(person_id: current_user.try(:id))

    @collection = @collection.includes(:tracker) if @include_tracker
    @collection = @collection.includes(:person) if @include_owner

    @collection = paginate!(@collection)
  end

  def show
    includes = []

    includes << :person if @include_owner
    includes << :tracker if @include_owner

    @item = ::TrackerPlugin.where(person_id: current_user.try(:id)).find params[:id]
  end

protected

  def parse_boolean_values
    @include_owner = params[:include_owner].to_bool
    @include_tracker = params[:include_tracker].to_bool
  end

end
