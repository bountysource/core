class Api::V2::IssuesController < Api::BaseController
  include Api::V2::PaginationHelper
  include Api::V2::IssuesHelper

  after_action log_activity(Issue::Event::VIEW), only: [:show]

  before_action :require_auth, only: :query_v3

  # yet another implementation... this one is used in issue dashboard
  def query_v3
    if params[:workflow]
      @collection = current_user.workflow_issues
    else
      raise "not sure what to do here"
    end

    @include_workflow_state = true
    @include_issue_team = true
    @include_issue_tracker = true

    render 'api/v2/issues/index'
  end

  def index
    @current_user = current_user

    @collection = ::Issue.not_deleted
    @include_issue_body_html = params[:include_body_html].to_bool
    @include_issue_tracker = params[:include_tracker].to_bool
    @include_team_extended = @include_issue_team = params[:include_team].to_bool
  

    if params.has_key?(:search)
      if params[:tracker_team_id]
        tracker_ids = Tracker.where(team_id: params[:tracker_team_id]).pluck(:id)
      elsif params.has_key?(:tracker_id)
        tracker_ids  = params[:tracker_id]
      end
    
      issue_ids = Issue.search(params[:search], :where => {tracker_id: tracker_ids}).map(&:id)
      @collection = @collection.where(id: issue_ids)
    end

    @collection = filter!(@collection)
    @collection = order!(@collection)
    @collection = paginate!(@collection)
    # Preload Trackers if including Tracker as child node of Issue
    if @include_issue_tracker
      @collection = @collection.includes(:tracker)
    end
  end

  def show
    @current_user = current_user
    @include_issue_body_html = (params[:include_body_html] || true).to_bool

    @include_issue_tracker = params[:include_tracker].to_bool
    @include_issue_languages = params[:include_languages].to_bool
    @include_issue_author = params[:include_author].to_bool
    @include_team_extended = @include_issue_team = params[:include_team].to_bool
    @include_issue_counts = params[:include_counts].to_bool

    if params[:can_respond_to_claims].to_bool && current_user
      @include_issue_can_respond_to_claims = true
    end

    includes = []
    includes << :tracker if @include_issue_tracker
    includes << :languages if @include_issue_languages
    includes << :author if @include_issue_author

    @item = ::Issue.find_with_merge(params[:id], include: includes)
    @item.remote_sync_if_necessary(person: @person)
    
    if @item.deleted_at
      render json: { error: 'Issue Not Found' }, status: :not_found
    end
  end

  # Manually add issues to Bountysource.
  # This action replaces the v1 action, because that was beyond salvation.
  def create
    @item = Issue.find_by_url(params[:issue_url])

    if @item
      response.status = :ok
    else
      # Find or create Tracker
      tracker = Tracker.find_by_url(params[:project_url])
      tracker ||= Tracker.create!(
        url: params[:project_url],
        name: params[:project_name]
      )

      @item = tracker.issues.create!(
        url: params[:issue_url],
        title: params[:title],
        number: params[:number]
      )

      response.status = :created
    end

    render 'api/v2/issues/show'
  end
end
