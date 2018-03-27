class Api::V1::TrackerPluginsController < ApplicationController

  before_action :require_auth

  before_action require_tracker(:tracker_id), only: [:create, :show, :update, :destroy]

  before_action :require_tracker_plugin,  only: [:show, :update, :destroy]
  before_action :require_github_account, only: [:create]

  def index
    @tracker_plugins = @person.tracker_plugins.includes(:tracker)
    render "api/v1/tracker_plugins/index"
  end

  def show
    render "api/v1/tracker_plugins/show"
  end

  def create
    # TODO: Use dat polymorphism when we get other plugins
    @tracker_plugin = TrackerPlugin::GH.new(person: @person, tracker: @tracker)

    @tracker_plugin.modify_title = params[:modify_title].to_bool if params.has_key?(:modify_title)
    @tracker_plugin.modify_body = params[:modify_body].to_bool if params.has_key?(:modify_body)
    @tracker_plugin.add_label = params[:add_label].to_bool if params.has_key?(:add_label)
    @tracker_plugin.label_name = params[:label_name] if params.has_key?(:label_name)
    @tracker_plugin.label_color = params[:label_color] if params.has_key?(:label_color)
    @tracker_plugin.last_error = nil
    @tracker_plugin.locked_at = nil

    @tracker_plugin.save!
    render "api/v1/tracker_plugins/show", status: :created
  rescue ActiveRecord::RecordNotSaved, ActiveRecord::RecordInvalid
    render json: { error: @tracker_plugin.errors.full_messages.join(', ') }, status: :unprocessable_entity
  end

  def update
    @tracker_plugin.modify_title = params[:modify_title].to_bool if params.has_key?(:modify_title)
    @tracker_plugin.add_label = params[:add_label].to_bool if params.has_key?(:add_label)
    @tracker_plugin.modify_body = params[:modify_body].to_bool if params.has_key?(:modify_body)
    @tracker_plugin.label_name = params[:label_name] if params.has_key?(:label_name)
    @tracker_plugin.label_color = params[:label_color] if params.has_key?(:label_color)
    
    if params.has_key?(:locked) && !params[:locked].to_bool
      @tracker_plugin.last_error = nil
      @tracker_plugin.locked_at = nil
    end

    @tracker_plugin.save!

    @tracker_relation = @person.tracker_relations.where(tracker_id: @tracker.id).first
    render "api/v1/tracker_relations/show"
  rescue ActiveRecord::RecordNotSaved, ActiveRecord::RecordInvalid
    render json: { error: @tracker_plugin.errors.full_messages.join(', ') }, status: :unprocessable_entity
  end

  def destroy
    if @tracker_plugin.destroy
      render json: {}, status: :no_content
    else
      render json: { error: @tracker_plugin.errors.full_messages.join(', ') }, status: :bad_request
    end
  end

protected

  def require_tracker_plugin
    @tracker_plugin = @tracker.plugin

    unless @tracker_plugin and @tracker_plugin.person == @person
      render json: { error: 'Tracker plugin not found' }, status: :not_found
    end
  end

  def require_github_account
    require_auth unless @person

    if !@person.github_account
      render json: { error: "You need to link a GitHub account to install the plugin" }, status: :bad_request
    elsif !@person.github_account.has_permission?("public_repo")
      render json: { error: "Public Repository permission required" }, status: :failed_dependency
    else
      ### Make sure this account can modify the repo

      # NOTE: It's not enough to just check if the user is a collaborator.
      unless @person.github_account.can_modify_repository?(@tracker)
        render json: { error: "Cannot write to this repository" }, status:  :failed_dependency
      end
    end
  end
end
