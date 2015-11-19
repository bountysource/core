class Api::V1::IssuesController < ApplicationController

  before_filter :require_auth, only: [:authored]
  before_filter require_issue(:id), only: [:show, :bounties]
  before_filter require_tracker(:tracker_id), only: [:index]

  after_filter log_activity(Issue::Event::VIEW), only: [:show]

  def show
  end

  def index
    @issues = @tracker.issues.not_deleted.active
  end

  # Because Warren told me to. Also, snakes.
  # This will be the future Issues index route, putting in some filter logic just for Team issues
  def doge_issues
    # Process the order_by param
    if params.has_key?(:order_by)
      case params[:order_by].try(:camelize)
      when 'IssueRank::TeamRank'
        require_params(:team_id)
        @issue_ranks = IssueRank::TeamRank.active.includes(:issue => [:tracker]).where(team_id: params[:team_id]).order('issue_ranks.rank DESC')

      when 'IssueRank::LinkedAccountGithub'
        require_params(:linked_account_id)
        @issue_ranks = IssueRank::LinkedAccountGithub.active.includes(:issue => [:tracker]).where(linked_account_id: params[:linked_account_id]).order('issue_ranks.rank DESC')

      when 'IssueRank'
        # ALL issue ranks. Groups them together by issue_id and orders by the max rank
        @issue_ranks = IssueRank.active.includes(:issue => [:tracker]).global
      end

      # If owner is specified, filter the Issues by Tracker owner
      @issue_ranks = filter_by_tracker_owner(@issue_ranks)

      # Reject closed issues
      @issue_ranks = @issue_ranks.where('issues.can_add_bounty=? and issues.deleted_at=?', true, nil)

      # Calculate min/max ranks
      @max_rank = @issue_ranks.active.first.rank

      return render 'api/v1/doge_issues/ranked_index'
    end

    # If you reach this point, render ALL Issues
    @issues = Issue.includes(:tracker).scoped
    render 'api/v1/doge_issues/index'
  end

  def authored
    @issues = Issue.authored_by(@person)
  end

  def activity
    #1 issues they have activity on
    #2 issues from trackers they have activity on
    #3 tracker rank top 10?
    if @person
      @issues = @person.personalized_issues #write method that returns personalized issues for user
    else
      @issues = Issue.top_issues_by_rank_cache(15, 100) #args => tracker_count, issue_count
    end
    render "api/v1/issues/activity"
  end

  def featured
    @issues = Issue.featured.includes(:tracker)
  end

  # def create
  #   @tracker = Tracker.where(url: params[:project_url], name: params[:project_name]).first_or_create
  #   @issue = @tracker.issues.where(url: params[:issue_url], number: params[:number], title: params[:title], can_add_bounty: true).references(:issues).first_or_create
  #
  #   if @issue.valid?
  #     render 'api/v1/issues/show'
  #   else
  #     errors = @issue.errors.full_messages.map { |e| "Issue #{e}" } + @tracker.errors.full_messages.map { |e| "Project #{e}" }
  #     render json: { error: "Unable to create issue: #{errors.join(', ')}" }, status: :unprocessable_entity
  #   end
  # end

  def bounties
    #route is not used
    @bounties = @issue.bounties.visible.includes(:owner)
  end

protected

  # If an owner_id and owner_type are provided on params,
  # filter the collection by an owner.
  # You can negate the filter by prepending either/both values with '!'.
  #
  # Note: 'NOT LIKE' does not include NULL column values, so if we are negating the type, we need to explicity check via OR IS NULL
  def filter_by_tracker_owner(collection)
    _collection = collection
    if params[:tracker_owner_type]
      negate_owner_type = params[:tracker_owner_type][0] == '!'
      tracker_owner_type = negate_owner_type ? params[:tracker_owner_type].slice(1..-1) : params[:tracker_owner_type]
      _collection = _collection.where("trackers.owner_type #{ negate_owner_type ? 'NOT LIKE' : 'LIKE' } ? #{ negate_owner_type ? 'OR trackers.owner_type IS NULL' : '' }", "#{tracker_owner_type.split('::').first}%")

      if params[:tracker_owner_id]
        negate_owner_id = params[:tracker_owner_id][0] == '!'
        tracker_owner_id = negate_owner_id ? params[:tracker_owner_id].slice(1..-1) : params[:tracker_owner_id]
        _collection = _collection.where("trackers.owner_id #{ negate_owner_id ? '!=' : '=' } ? #{ negate_owner_type ? 'OR trackers.owner_id IS NULL' : '' }", tracker_owner_id.to_i)
      end
    end
    _collection
  end
end
