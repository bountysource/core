class Api::V0::FundraisersController < Api::V0::BaseController

  before_filter :require_fundraiser, except: [:recent, :recent_pledges, :index]
  before_filter :require_tracker, only: [:add_tracker_relation, :remove_tracker_relation]

  def show
    render "api/v1/fundraisers/admin"
  end

  def index
    if params[:person_id]
      @fundraisers = Person.find(params[:person_id]).fundraisers.includes(:person)
      render "api/v0/fundraisers/index_for_person"
    else
      @fundraisers = Fundraiser.includes(:person).order('featured desc, published desc, created_at desc')
      render "api/v1/fundraisers/index"
    end
  end

  def update
    @fundraiser.published = params[:published]
    @fundraiser.featured  = params[:featured]
    @fundraiser.hidden    = params[:hidden]

    # if un-publishing, also remove the published_at date
    @fundraiser.published_at = @fundraiser.published ? DateTime.now : nil

    if @fundraiser.save
      render "api/v1/fundraisers/show"
    else
      render json: { error: @fundraiser.errors.full_messages.join(', ') }
    end
  end

  def destroy
    if @fundraiser.account_balance > 0
      render json: { error: "Cannot delete fundraiser with account activity" }, status: :bad_request
    elsif @fundraiser.destroy
      render json: { message: 'Fundraiser deleted' }, stauts: :ok
    else
      render json: { error: @fundraiser.errors.full_messages.join(', ') }, status: :bad_request
    end
  end

  #refactor this tracker relation stuff... doing it quik 'n derty
  def tracker_relations
    @trackers = @fundraiser.trackers
    render "api/v0/fundraisers/tracker_relations"
  end

  def add_tracker_relation
    relation = @fundraiser.fundraiser_tracker_relations.build(tracker: @tracker)

    if relation.save
      @trackers = @fundraiser.trackers
      render "api/v0/fundraisers/tracker_relations"
    else
      render json: {errors: relation.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def remove_tracker_relation
    relation = @fundraiser.fundraiser_tracker_relations.where(tracker_id: @tracker.id).first
    if relation.destroy
      @trackers = @fundraiser.reload.trackers
      render "api/v0/fundraisers/tracker_relations", status: :ok
    else
      render json: {errors: relation.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

protected

  def require_fundraiser
    @fundraiser = Fundraiser.where(id: params[:id]).includes(:rewards).first
    render json: { error: 'Fundraiser not found' }, status: :not_found unless @fundraiser
  end

  def require_tracker
    unless @tracker = Tracker.where(id: params[:tracker_id]).first
      render json: { error: 'Tracker not found' }, status: :not_found
    end
  end
end
