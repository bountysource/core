class Api::V1::TrackerRelationsController < ApplicationController

  before_filter :require_auth
  before_filter :require_tracker_relation, only: [:show]

  def index
    @tracker_relations = @person.tracker_relations
    render "api/v1/tracker_relations/index"
  end

  def show
    render "api/v1/tracker_relations/show"
  end

protected

  def require_tracker_relation
    unless (@tracker_relation = @person.tracker_relations.find_by_id params[:id])
      render json: { error: 'Tracker relation not found' }, status: :not_found
    end
  end

end