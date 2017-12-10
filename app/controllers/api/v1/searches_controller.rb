class Api::V1::SearchesController < ApplicationController

  before_filter :find_person, only: [:create, :bounty_search]

  # tracker typeahead
  def typeahead
    raise "Must be type=tracker" unless params[:type] == 'tracker'
    @trackers = Search.tracker_typeahead(params[:query])
  end

  def create
    begin
      @results = Search.create(query: params[:query], person: @person).results

      case
      when @results.issue
        render json: { async: false, redirect_to: @results.issue.frontend_path, tracker_id: @results.issue.tracker.id }, status: :ok
      when @results.tracker
        if @results.async?
          render json: { async: true, job_id: @results.job_id, tracker: render_rabl_template(@results.tracker, "api/v1/trackers/partials/base") }, status: :accepted
        else
          render json: { async: false, redirect_to: @results.tracker.frontend_path }, status: :ok
        end
      when @results.issues || @results.trackers
        # TODO Preload trackers on issues. The rabl template causes repeated
        # database queries for trackers.
        render 'api/v1/searches/show'
      else
        render_no_results_error
      end
    rescue Github::API::NotFound
      render_no_results_error
    end
  end

  def bounty_search
    options = {
      search: params[:search],
      page: params[:page],
      per_page: params[:per_page],
      languages: params[:languages],
      trackers: params[:trackers],
      min: params[:min],
      max: params[:max],
      order: params[:order],
      direction: params[:direction]
    }
    @results = Search.bounty_search(options)

    # Log the search
    Search.create(query: "bounty search", params: options, person: @person)

    @issues = @results[:issues]
    @issues_total = @results[:issues_total]
  end

protected

  def render_no_results_error
    render json: { error: "No results for #{params[:query]}" }, status: :not_found
  end
end
