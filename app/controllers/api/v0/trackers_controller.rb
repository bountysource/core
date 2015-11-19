class Api::V0::TrackersController < Api::V0::BaseController

  before_filter :require_tracker, except: [:index]

  def index
    @trackers = Tracker.order("watchers DESC").includes(:team)
    render "api/v0/trackers/index"
  end

  def show
    render "api/v0/trackers/show"
  end

  def update

    #first update language associations
    languages = Language.where(id: params["language_ids"])
    new_languages = languages.reject { |lang| @tracker.languages.include?(lang) }

    @tracker.languages << new_languages

    removed_languages = @tracker.languages.pluck(:name) - languages.map { |lang| lang.name }

    removed_languages.each do |language_name|
      language = Language.where(name: language_name).first
      relation = @tracker.language_relations.where(language_id: language.id).first
      relation.destroy
    end

    #then update attributes
    attrs = params.select { |k,_| Tracker.accessible_attributes.include?(k) }
    if @tracker.update_attributes(attrs)
      render json: { notice: "Updated" }, status: :ok
    else
      render json: { error: "Error" }, status: :unprocessable_entity
    end
  end

  def sync
    @tracker.delay.remote_sync
    render nothing: true, status: :accepted
  end

  def full_sync
    @tracker.delay.full_sync
    render json: { success: true }
  end

  protected

  def require_tracker
    unless @tracker = Tracker.find(params[:id])
      render json: { error: "Team not found" }, status: :not_found
    end
  end

end
