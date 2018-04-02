class Api::V1::TeamsController < ApplicationController

  before_action require_tracker(:tracker_id), only: [:add_tracker, :remove_tracker]

  before_action :require_auth, except: [:show, :index, :all_members, :trackers, :activity, :bounties, :issues]
  before_action :require_team, except: [:create, :index]
  before_action :require_member, only: [:update_member, :remove_member]

  before_action :require_modify_team_members, only: [:add_member, :update_member, :remove_member]
  before_action :require_modify_team_projects, only: [:add_tracker, :remove_tracker]

  def show
  end

  def index
    @teams = Team.scoped

    case params.try(:[], :filter)
    when 'featured' then @teams = @teams.where(featured: true)
    end
  end

  # create a new team
  # Note: also adds the auth'd person to the team as an admin
  def create
    require_params :name

    @team = Team.create(team_params)

    if @team.valid?
      @team.add_member(@person, admin: true, no_emails: true, developer: true, public: true)

      render "api/v1/teams/show", status: :created
    else
      render json: { error: @team.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def update
    can_edit_everything = can?(:modify_team, @team)
    can_edit_some = can_edit_everything || @team.has_no_members?

    if can_edit_some
      @team.name = params[:name] unless params[:name].blank?
      @team.slug = params[:slug] unless params[:slug].blank?
      @team.url = params[:url] if params.has_key?(:url)
      @team.bio = params[:bio] if params.has_key?(:bio)
      @team.image_url = params[:image_url] if params.has_key?(:image_url)
      @team.homepage_markdown = params[:homepage_markdown] if params.has_key?(:homepage_markdown)

      if can_edit_everything
        @team.accepts_public_payins = params[:accepts_public_payins] if params.has_key?(:accepts_public_payins)
        @team.accepts_issue_suggestions = params[:accepts_issue_suggestions] if params.has_key?(:accepts_issue_suggestions)
      end

      if @team.save
        render "api/v1/teams/show"
      else
        render json: { error: @team.errors.full_messages.to_sentence }, status: :unprocessable_entity
      end
    else
      render json: { error: "Not allowed" }, status: :forbidden
    end
  end

  def trackers
    @tracker_relations = @team.tracker_relations.includes(:tracker, :owner)
    render "api/v1/teams/trackers"
  end

  def add_tracker
    relation = @team.relation_for_tracker(@tracker)

    if relation
      render "api/v1/teams/show", status: :not_modified
    else
      @team.add_tracker(@tracker)
      render "api/v1/teams/show", status: :ok
    end
  end

  def remove_tracker
    relation = @team.relation_for_tracker(@tracker)

    if relation
      @team.remove_tracker(@tracker)
      render "api/v1/teams/show"
    else
      render json: { error: "Tracker not found" }, status: :not_found
    end
  end

  def all_members
    @member_relations = can?(:modify_team_members, @team) ? @team.member_relations.members_only : @team.public_member_relations(@person)
    render "api/v1/teams/members"
  end

  def add_member
    require_params :email

    person = params[:email].match(/\A\d+\Z/) ? Person.where(id: params[:email]).first! : Person.where(email: params[:email]).first!
    permissions = { admin: false, developer: false, public: true }

    permissions[:admin] = params[:admin].to_bool if params.has_key?(:admin)
    permissions[:developer] = params[:developer].to_bool if params.has_key?(:developer)
    permissions[:public] = params[:public].to_bool if params.has_key?(:public)

    if person
      # person already has a bountysource account, add them
      @team.add_member(person, permissions)
      @member_relation = @team.relation_for_owner(person)
      render "api/v1/teams/partials/member"
    else
      # email not registered with a bountysoruce account.
      # invite this person to join the team
      @team.invite_member(params[:email], permissions)
      render json: {}, status: :accepted
    end
  end

  # update permissions of a member
  def update_member
    @member_relation = @team.relation_for_owner(@member)

    @member_relation.admin = params[:admin].to_bool if params.has_key?(:admin)
    @member_relation.developer = params[:developer].to_bool if params.has_key?(:developer)
    @member_relation.public = params[:public].to_bool if params.has_key?(:public)

    # if 0, will remove the budget constraint, giving dev access to whole team funds. see relation#set_budget
    @member_relation.set_budget(params[:budget]) if params.has_key?(:budget)

    if @member_relation.valid?
      # if any of the permissions changed, trigger email to affected member and admins
      if @member_relation.admin_changed? || @member_relation.developer_changed? || @member_relation.public_changed?
        # send the member an email (unless you are the admin that made the change)
        @member_relation.person.send_email(:team_permissions_changed, admin: @person, team: @team, member_relation: @member_relation) unless @member_relation.person == @person

        # send the team admins an email (excluding yourself)
        @team.admins.each { |admin| admin.send_email(:team_member_permissions_changed, admin: @person, team: @team, member_relation: @member_relation) unless admin == @person }
      end

      @member_relation.save
      render "api/v1/teams/partials/member"
    else
      render json: { error: @member_relation.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def remove_member
    if @team.remove_member(@member)
      head :no_content
    else
      render json: { error: relation.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def activity
    @bounties = @team.active_bounties.where(anonymous: false).order("created_at desc").limit(50).includes(:issue)
    @pledges = @team.pledges.where(anonymous: false).order("created_at desc").limit(50).includes(:fundraiser)

    public_members = @team.public_members
    @member_relations = @team.member_relations.where(person_id: public_members.pluck(:id)).order("created_at desc").limit(50)
  end

  def bounties
    @bounties = @team.bounties.visible.order("created_at desc").limit(300).includes(issue: [{tracker: :team}, :solutions, :developer_goals, :bounty_claims, :solutions])

    # quick non-sql hack to merge multiple bounties on the same issue into one
    ignore_bounty_ids = []
    @bounties.to_a.group_by(&:issue_id).select { |issue_id,bounties| bounties.length > 1 }.each do |issue_id, bounties|
      first_bounty = bounties.first
      bounties[1..-1].each do |dupe|
        first_bounty.amount += dupe.amount
        ignore_bounty_ids.push(dupe.id)
      end
    end
    @bounties = @bounties.reject { |b| ignore_bounty_ids.include?(b.id) }
  end

protected

  def require_team
    unless (@team = Team.find_by_slug(params[:id].downcase))
      render json: { error: "Team not found" }, status: :not_found
    end
  end

  def require_modify_team_members
    unless can?(:modify_team_members, @team)
      render json: { error: "Not allowed" }, status: :forbidden
    end
  end

  def require_modify_team
    unless can?(:modify_team, @team)
      render json: { error: "Not allowed" }, status: :forbidden
    end
  end

  def require_modify_team_projects
    unless can?(:modify_team_projects, @team)
      render json: { error: "Not allowed" }, status: :forbidden
    end
  end

  def require_member
    require_team unless @team
    unless (@member = @team.members.where(id: params[:member_id]).first)
      render json: { error: "Member not found" }, status: :not_found
    end
  end

  def team_params
    params.permit(:name, :slug, :url, :bio, :image_url)
  end
end
