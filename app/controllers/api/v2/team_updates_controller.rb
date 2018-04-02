class Api::V2::TeamUpdatesController < Api::BaseController

  include Api::V2::PaginationHelper
  include Api::V2::BaseHelper

  before_action :load_team, only: [:index]
  before_action :require_team, except: [:index]

  before_action :require_team_update, only: [:show, :update]
  before_action :require_team_admin, only: [:create, :update]

  def index
    if @team
      @collection = @team.updates
    else
      @collection = TeamUpdate.all.reorder('published_at desc')
      @include_team = true
      @include_truncated_body = true
    end

    @collection = @collection.published unless params[:include_unpublished] && is_team_admin?

    @include_body = params[:include_body].to_bool

    @collection = paginate!(@collection)
  end

  def show
    @include_body = true
    render 'show'
  end

  def create
    @item = @team.updates.new
    apply_params_to_item
    @include_body = true
    render 'show', status: :created
  end

  def update
    if @item.published?
      raise "already published"
    else
      apply_params_to_item
      render 'show', status: :ok
    end
  end

  def mailing_lists
    full_lists = TeamUpdate.distribution_lists_for_team(@team)
    render json: {
      bountysource_users: full_lists[:people_ids].length,
      github_users: full_lists[:linked_account_ids].length
    }
  end

protected

  def apply_params_to_item
    # attributes
    @item.title = params[:title] if params.has_key?(:title)
    @item.body = params[:body] if params.has_key?(:body)
    if params.has_key?(:mailing_lists)
      @item.mailing_lists = [params[:mailing_lists]].flatten.join(',').split(',') & ['bountysource', 'github']
    end
    @item.save!

    # email the author a test email
    @item.send_test_email(person: current_user) if params[:email_me]

    # publish the update to everybody
    #TODO require current_user.github_account.oauth_token if mailing_lists.include?('github')
    @item.publish!(oauth_token: current_user.github_account.try(:oauth_token)) if params[:publish]
  end

  def load_team
    if params.has_key?(:team_id)
      @team = Team.where(id: params[:team_id]).first!
    elsif params.has_key?(:team_slug)
      @team = Team.where(slug: params[:team_slug]).first!
    end
  end

  def require_team
    load_team
    raise ActiveRecord::RecordNotFound unless @team
  end

  def require_team_update
    @collection = @team.updates
    @collection = @collection.published unless is_team_admin?

    # 0-132 is a hacky notation to differentiate ID from NUMBER
    if params[:id].starts_with?('00-')
      @collection = @collection.where(id: params[:id][3..-1])
    else
      @collection = @collection.where(number: params[:id])
    end

    @item = @collection.first!
  end

  def require_team_admin
    raise ActiveRecord::RecordNotFound unless is_team_admin?
  end

  def is_team_admin?
    current_user && @team && @team.person_is_admin?(current_user)
  end

end
