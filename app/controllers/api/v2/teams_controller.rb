class Api::V2::TeamsController < Api::BaseController

  include Api::V2::BaseHelper
  include Api::V2::PaginationHelper

  before_action :require_auth, only: [:update]
  before_action :require_team, only: [:update, :show]
  before_action :parse_options

  def index
    @collection = ::Team.all


    # Filter by featured
    if params.has_key?(:featured)
      @collection = @collection.featured.order('activity_total desc')
    end

    if params.has_key?(:search)
      params[:search].split(' ').each do |term|
        @collection = @collection.where("lower(name) like lower(?)", "%#{term}%")
      end
    end

    if params.has_key?(:accepts_public_payins)
      @collection = @collection.accepts_public_payins.order('GREATEST(COALESCE(monthly_contributions_sum,0.0), COALESCE(previous_month_contributions_sum,0.0)) desc')
    end

    # Filter by featured
    if params.has_key?(:newest)
      @collection = @collection.newest
    end

    # used in salt cart for showing display-as
    if params.has_key?(:my_teams) && current_user
      my_team_ids = current_user.team_member_relations.members_only.pluck(:team_id)
      @collection = @collection.where(id: my_team_ids)
    end

    # used in topnav
    if params.has_key?(:my_teams_and_suggestions) && current_user
      params[:per_page] ||= 250
      my_team_ids = current_user.team_member_relations.pluck(:team_id)
      @collection = @collection.where(id: my_team_ids)
      @include_team_permissions = true
      if current_user.github_account && !current_user.github_account.synced?
        current_user.github_account.sync_all_data_if_necessary
        headers['X-API-Retry-After'] = '2'
      end
    end

    # Filter by homepage
    if params.has_key?(:homepage_featured)
      @collection = @collection.where("homepage_featured > 0").order(:homepage_featured)
    end
    
    if params[:tag_child_type] == 'TeamSlug'
      params[:tag_child_type] = 'Team'
      params[:tag_child_id] = Team.where(slug: params[:tag_child_id]).first!.id
      child = Team.find(params[:tag_child_id])
    elsif params[:tag_child_type] == 'Tag'
      child = Tag.find(params[:tag_child_id])
    end

    if TagRelation::VALID_CLASSES.include?(params[:tag_child_type]) && params.has_key?(:tag_child_id) && params[:tag_child_id].to_i>0
      parent_ids = child.child_tag_relations.pluck(:parent_id)
      @collection = Team.where(id: parent_ids)
    elsif params.has_key?(:tag_parent_type) && params.has_key?(:tag_parent_id) && params[:tag_parent_id].to_i>0
      @collection = @collection.joins(:tag_relations).where("tag_relations.parent_id" => params[:tag_parent_id], "tag_relations.parent_type" => params[:tag_parent_type]).where('weight>0').order('activity_total desc')
    end

    if params[:team_inclusion_parent]
      parent_team = Team.where(slug: params[:team_inclusion_parent]).first!
      @collection = @collection.joins(:child_team_activity_inclusions).where("team_activity_inclusions.parent_team_id" => parent_team.id)
    end

    if params[:related_to_team]
      team = Team.where(slug: params[:related_to_team]).first!
      team_ids = []

      # they've included it in their feed
      @team_included_ids = team.parent_team_activity_inclusions.pluck(:child_team_id)

      # they're a backer
      @team_backer_ids = (team.bounties.not_refunded.joins(:issue => :tracker).pluck(:team_id) +
                          team.pledges.active.joins(:fundraiser).pluck(:team_id) +
                          team.created_payins.pluck(:team_id)).uniq

      # they've tagged against it
      @team_tagged_ids = team.child_tag_relations.where('weight>0').pluck(:parent_id)

      @collection = @collection.where(id: (@team_backer_ids + @team_included_ids + @team_tagged_ids).uniq).where.not(id: team.id).order('activity_total desc')
    end
    @collection = paginate!(@collection)

    @include_team_extended = true if params[:include_extended]
    @include_team_bio = true if params[:include_bio]
    @include_team_supporter_stats = params[:include_supporter_stats]
    @disclude_expensive_team_params_for_index = true
  end

  def update
    # claim a team
    if params[:claim]
      if @item.person_can_claim?(current_user)
        # no admins, and they have a github relation, claim the team!
        @item.claim_team(current_user)
        render json: { claim: 'success' }
      elsif @item.has_members? && !params[:request_invite]
        # email team admins
        render json: { claim: 'request_invite' }
      elsif @item.has_members? && params[:request_invite]
        # email team admins
        @item.member_requested_invite(current_user)
        render json: { claim: 'pending' }
      else
        TeamClaim.create!(team: @item, person: current_user, claim_notes: params[:notes])
        render json: { claim: 'pending' }
      end
      return
    end

    if is_team_admin?

      # ensure support_offering object is created
      if params[:support_offering] || params[:create_support_offering_reward]
        @item.support_offering = @item.create_support_offering unless @item.support_offering
      end

      # title, markdown, youtube, goals, etc
      if params[:support_offering]
        @item.support_offering.update_attributes(support_offering_params)
      end

      # TODO: could require is_admin on child_team as well
      if params[:add_child_team_inclusion]
        child_team = Team.where(slug: params[:add_child_team_inclusion]).first!
        @item.parent_team_activity_inclusions.where(child_team: child_team).first_or_create!
      end

      if params[:remove_child_team_inclusion]
        child_team = Team.where(slug: params[:remove_child_team_inclusion]).first!
        @item.parent_team_activity_inclusions.where(child_team: child_team).delete_all
      end
    end

    @include_team_extended = true
    render 'api/v2/teams/show'
  end

  def show
    @include_team_extended = true
    @include_team_permissions = true
    @include_team_supporter_stats = params[:include_supporter_stats]
    @include_team_support_offering = params[:include_support_offering]
  end

private

  def support_offering_params
    params.require(:support_offering).permit(:subtitle, :body_markdown, :youtube_video_url, :goals, :extra)
  end

  def require_team
    collection = Team.all
    collection = collection.accepts_public_payins if params.has_key?(:accepts_public_payins)

    if params[:team_id]
      @item = collection.find_by!(id: params[:team_id].downcase)
    else
      @item = collection.find_by!(slug: params[:id].downcase)
    end
  end

  def is_team_member?
    @item.person_is_member?(current_user)
  end

  def is_team_admin?
    @item.person_is_admin?(current_user)
  end

  def is_team_developer?
    @item.person_is_developer?(current_user)
  end

  def is_team_public?
    @item.person_is_public?(current_user)
  end

  def parse_options
    @show_rfp_enabled_flag = current_user.try(:admin?)
  end

end
