class Api::V0::Github::RepositoriesController < Api::V0::BaseController

  before_action :require_tracker

  def index
    @trackers = case params[:filter]
      when /featured/ then Github::Repository.where(featured: true)
      else Github::Repository.all
    end

    render json: @trackers
  end

  def show
    render json: @tracker
  end

  def update
    @tracker.update_attributes(repositories_params)
    render json: @tracker
  end

protected

  def require_tracker
    unless (@tracker = Github::Repository.find_by_full_name("#{params[:login]}/#{params[:repository]}"))
      render json: { error: "Repository not found" }, status: :not_found
    end
  end

  def repositories_params
    params.permit(:watchers, :forks, :is_fork, :remote_id, :full_name, :pushed_at, :has_issues, :has_wiki, :has_downloads, :private, :homepage)
  end
end