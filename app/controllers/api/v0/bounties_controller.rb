class Api::V0::BountiesController < Api::V0::BaseController

  before_action :require_bounty, only: [:show, :move, :refund, :acknowledge, :unacknowledge, :update]

  def show
    render "api/v0/bounties/show"
  end

  def index
    if params[:person_id]
      @bounties = Person.find(params[:person_id]).bounties.includes(:issue => :tracker)
      render "api/v0/bounties/index_for_person"
    else
      if params[:csv]
        @csv_bounties = Bounty.find_by_sql("SELECT * FROM public.bounties");
        render "api/v0/bounties/csv.json.rb"
      else
      @bounties = Bounty.includes(:person, :issue).order('created_at desc')
      render "api/v0/bounties/index"
      end
    end
  end

  def update
    updates = {}
    updates[:featured] = params[:featured].to_bool if params.has_key?(:featured)
    updates[:anonymous] = params[:anonymous].to_bool if params.has_key?(:anonymous)

    if params[:owner_type] == 'Person' && (person = Person.find_by(id: params[:owner_id]))
      updates[:owner_type] = 'Person'
      updates[:owner_id] = person.id
    elsif params[:owner_type] == 'Team' && (team = Team.find_by(id: params[:owner_id]) || Team.find_by(slug: params[:owner_id]))
      updates[:owner_type] = 'Team'
      updates[:owner_id] = team.id
    end
    @bounty.update_attributes!(updates)
    render "api/v0/bounties/show"
  end

  def refund
    @bounty.refund!(!!params[:fraud])

    if @bounty.errors.empty?
      render "api/v0/bounties/show"
    else
      render json: { error: @bounty.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def move
    @issue = Issue.find(params[:issue_id])
    @bounty.move_to_issue(@issue)

    if @bounty.errors.empty?
      render "api/v0/bounties/show"
    else
      render json: { error: @bounty.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def acknowledge
    if @bounty.acknowledged_at?
      head :not_modified
    elsif @bounty.update_attributes(acknowledged_at: DateTime.now)
      head :ok
    else
      render json: { error: @bounty.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def unacknowledge
    if @bounty.acknowledged_at.nil?
      head :not_modified
    elsif @bounty.update_attributes(acknowledged_at: nil)
      head :ok
    else
      render json: { error: @bounty.errors.full_messages.to_sentence }, status: :bad_request
    end
  end

  def acknowledged
    @bounties = Bounty.acknowledged.includes(:person, :owner, :issue => [:tracker])
    render "api/v0/bounties/index"
  end

  def unacknowledged
    @bounties = Bounty.unacknowledged.includes(:person, :owner, :issue => [:tracker])
    render "api/v0/bounties/index"
  end

protected

  def require_bounty
    unless (@bounty = Bounty.find_by_id params[:id])
      render json: { error: 'Bounty not found' }, status: :not_found
    end
  end

end
