class Api::V1::BulkController < ApplicationController

  def issues
    require_params :repo_full_name, :numbers

    tracker = Tracker.find_by_full_name(params[:repo_full_name])
    @issues = []
    if tracker
      @issues += tracker.issues.where(number: params[:numbers].split(','))
    end
  end

  def trackers
    require_params :ids
    ids = params[:ids].split(",")
    @trackers = Tracker.where(id: ids)
    render "api/v1/trackers/index"
  end

end
