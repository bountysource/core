class Api::V0::TrackerPluginsController < Api::V0::BaseController

  before_filter :require_tracker_plugin, except: [:index]

  def index
    @tracker_plugins = TrackerPlugin.includes(:tracker, :person).order('locked_at asc, created_at desc')
    render "api/v0/tracker_plugins/index"
  end

  def show
  end

  def update
    @tracker_plugin.modify_body = params[:modify_body].to_bool if params.has_key?(:modify_body)
    @tracker_plugin.modify_title = params[:modify_title].to_bool if params.has_key?(:modify_title)
    @tracker_plugin.add_label = params[:add_label].to_bool if params.has_key?(:add_label)
    @tracker_plugin.label_name = params[:label_name] if params.has_key?(:label_name)
    @tracker_plugin.label_color = params[:label_color] if params.has_key?(:label_color)

    if params.has_key?(:locked) && !params[:locked].to_bool
      @tracker_plugin.last_error = nil
      @tracker_plugin.locked_at = nil
    end

    @tracker_plugin.save!
    render "api/v1/tracker_plugins/show"
  rescue ActiveRecord::RecordNotSaved, ActiveRecord::RecordInvalid
    render json: { error: @tracker_plugin.errors.full_messages.to_sentence }, status: :unprocessable_entity
  end

protected

  def require_tracker_plugin
    unless (@tracker_plugin = TrackerPlugin.find_by_id(params[:id]))
      render json: { error: "Tracker plugin not found" }, status: :not_found
    end
  end
end
