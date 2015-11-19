class Api::V0::Github::RepositoriesController < Api::V0::BaseController

  before_filter :require_tracker

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
    attrs = params.select { |k,_| Github::Repository.accessible_attributes.include? k }
    @tracker.update_attributes attrs unless attrs.empty?
    render json: @tracker
  end

protected

  def require_tracker
    unless (@tracker = Github::Repository.find_by_full_name("#{params[:login]}/#{params[:repository]}"))
      render json: { error: "Repository not found" }, status: :not_found
    end
  end
end