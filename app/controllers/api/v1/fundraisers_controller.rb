class Api::V1::FundraisersController < ApplicationController
  respond_to :json

  before_filter :require_auth,                  except: [:show, :embed, :cards, :all, :top_backers]
  before_filter :require_fundraiser,            only:   [:update, :save, :show, :embed, :publish, :destroy, :info, :top_backers]
  before_filter :require_fundraiser_ownership,  only:   [:update, :publish, :destroy, :info]
  before_filter :required_published,            only:   [:show, :embed]

  def index
    @fundraisers = @person.fundraisers.order('published desc')
  end

  def show
  end

  def create
    @fundraiser = @person.fundraisers.new(title: params[:title])
    @fundraiser.description       = params[:description]        unless params[:description].blank?
    @fundraiser.short_description = params[:short_description]  unless params[:short_description].blank?
    @fundraiser.days_open         = params[:days_open]          unless params[:days_open].blank?
    @fundraiser.team_id           = params[:team_id]            unless params[:team_id].blank? || !@person.teams.map(&:id).include?(params[:team_id].to_i)

    # special case for funding_goal, remove commas and dollar signs
    @fundraiser.funding_goal = Money.parse(params[:funding_goal]).amount.to_i if params[:funding_goal]

    if @fundraiser.valid? && @fundraiser.save
      render "api/v1/fundraisers/show", status: :created
    else
      render json: { error: @fundraiser.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    @fundraiser.title             = params[:title]              if params[:title]
    @fundraiser.short_description = params[:short_description]  if params[:short_description]
    @fundraiser.description       = params[:description]        if params[:description]
    @fundraiser.days_open         = params[:days_open]          if params[:days_open]
    @fundraiser.team_id           = params[:team_id]            if params.has_key?(:team_id) && (params[:team_id].nil? || @person.teams.map(&:id).include?(params[:team_id].to_i))

    # special case for funding_goal, remove commas and dollar signs
    @fundraiser.funding_goal = Money.parse(params[:funding_goal]).amount.to_i if params[:funding_goal]

    if @fundraiser.valid? && @fundraiser.save
      render "api/v1/fundraisers/show"
    else
      render json: { error: @fundraiser.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def publish
    if @fundraiser.publish!
      render "api/v1/fundraisers/show"
    else
      render json: { error: @fundraiser.errors.full_messages }, status: :bad_request
    end
  end

  def destroy
    if @fundraiser.destroy
      render json: {}, status: :no_content
    else
      render json: { error: @fundraiser.errors.full_messages.join(', ') }, status: :bad_request
    end
  end

  def embed
    @funding_percentage = [1, ((@fundraiser.total_pledged.to_f/@fundraiser.funding_goal.to_f) * 100)].max.to_i
  end

  def info
    # reload to clear the zero-reward hiding preloader that ran in #require_fundraiser
    @fundraiser.reload
    @rewards = @fundraiser.rewards.includes(:pledges)
  end

  def cards
    @in_progress  = Fundraiser.featured.in_progress.order('funding_goal desc').limit(100)
    @completed    = Fundraiser.featured.completed.order('funding_goal desc').limit(100) - @in_progress
  end

  def top_backers
    @owners_array = @fundraiser.top_backers(params[:per_page])
    render "api/v1/pledges/top_backers"
  end

  def all
    @fundraisers = Fundraiser.includes(:person, :pledges, :team).where(hidden: false).published
    render "api/v1/fundraisers/index"
  end

protected

  def require_fundraiser
    @fundraiser = Fundraiser.where(id: params[:id]).includes(:rewards, :team).first
    render json: { error: 'Fundraiser not found' }, status: :not_found unless @fundraiser
  end

  def required_published
    require_fundraiser unless @fundariser

    unless @fundraiser.published? || (@person && @person.can_view?(@fundraiser))
      render json: { error: 'Fundraiser not found' }, status: :not_found
    end
  end

  def require_fundraiser_ownership
    find_person unless @person
    require_fundraiser unless @fundraiser

    # unless the person is authoritative (owner or admin), or fundraiser is published (for show action only)
    unless @person && @person.can_view?(@fundraiser)
      render json: { error: 'Fundraiser not found' }, status: :not_found
    end
  end
end
