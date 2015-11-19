class Api::V1::TrackersController < ApplicationController

  before_filter require_tracker(:id), except: [:cards, :index, :followed, :top]

  before_filter :require_auth,    only: [:upvote_tag, :downvote_tag, :show_tag, :followed]
  # before_filter :require_tag,     only: [:upvote_tag, :downvote_tag, :show_tag]
  # before_filter :require_tag_relation, only: [:upvote_tag, :downvote_tag, :show_tag]

  # for claim/unclaim of trackers
  before_filter :require_owner, only: [:claim, :unclaim]
  before_filter :require_modify_team_projects, only: [:claim, :unclaim]

  #loggin user activity
  after_filter log_activity(Tracker::Event::VIEW), only: [:show, :overview]

  def index
    @trackers = Tracker.not_deleted.where(has_issues: true).order('trackers.bounty_total DESC, watchers DESC')

    case params.try(:[], :filter)
    when 'top' then @trackers = @trackers.top_ranked
    end
  end

  def show
    render "api/v1/trackers/show"
  end

  def cards
    @featured_trackers  = Tracker.featured.order('bounty_total desc').limit(20)
    @all_trackers       = Tracker.valuable.not_featured.limit(20)
  end

  def create_tag
    require_params :name

    if (@tag = Tag.find_by_name params[:name])
      # tag already exists? return 200
      render "api/v1/tags/show", status: :ok
    elsif (@tag = Tag.find_or_create_by_name_and_associate_with params[:name], @tracker)
      # magically create and associate it with the Tracker
      render "api/v1/tags/show", status: :created
    else
      render json: { error: @tag.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def upvote_tag
    TagVote.find_or_create_by_person_and_relation_and_cast_vote @person, @tag_relation, 1
    render text: 'ok', status: :ok
  end

  def downvote_tag
    TagVote.find_or_create_by_person_and_relation_and_cast_vote @person, @tag_relation, -1
    render text: 'ok', status: :ok
  end

  def show_tag
    render json: {
      weight:     @tag_relation.weight,
      upvotes:    @tag_relation.joins(:votes).where('votes.value > 0').count,
      downvotes:  @tag_relation.joins(:votes).where('votes.value < 0').count
    }
  end

  def activity
    @claims_submitted = @tracker.bounty_claims.in_dispute_period.includes(:person, :issue)
    @claims_collected = @tracker.bounty_claims.where(collected: true).includes(:person, :issue)
    @claims_disputed = @tracker.bounty_claims.where(collected: false, rejected: false, disputed: true).includes(:person)
    @bounties_placed = @tracker.active_bounties.where(anonymous: false).includes(:issue, :person)
  end

  def claim
    @team = @tracker.claim(@owner) # need @team for rabl template
    render "api/v1/teams/show", status: :created
  end

  def unclaim
    @tracker.unclaim
    @team = @owner # need @team for rabl template
    render "api/v1/teams/show"
  end

  def top_backers
    @top_backers_map = @tracker.backers
    @top_backers = @top_backers_map.keys
  end

  # Get trackers that the authenticated person follows
  def followed
    @trackers = @person.followed_trackers
  end

protected

  def require_owner
    require_params :owner_id, :owner_type

    # Wow, so safe.
    @owner = params[:owner_type].constantize.find_by_id(params[:owner_id])
  end

  def require_modify_team_projects
    unless can?(:modify_team_projects, @owner)
      render json: { error: "Not allowed" }, status: :forbidden
    end
  end
end
