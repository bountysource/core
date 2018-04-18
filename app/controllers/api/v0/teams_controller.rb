class Api::V0::TeamsController < Api::V0::BaseController

  before_action :require_team, except: [:index, :create]

  def index
    @teams = Team.select("teams.*,
                (select count(id) from team_member_relations where team_id=teams.id) as member_relations_count,
                (select count(id) from tag_relations where child_type='Team' and child_id=teams.id) as tag_relations_count,
                (select coalesce(sum(amount),0) from accounts, splits where splits.account_id=accounts.id and accounts.owner_type='Team' and accounts.owner_id=teams.id) as account_splits_total
                ".gsub("\n", " "))

    if params[:person_id]
      @teams = @teams.where(id: TeamMemberRelation.where(person_id: params[:person_id]).pluck(:team_id))
    end
  end

  def show
  end

  def create
    if params.has_key?(:tracker_id)
      tracker = Tracker.find(params[:tracker_id])
      slug = tracker.name.parameterize
      slug = "#{slug}-#{Time.now.to_i}" if Team.where(slug: slug).count > 0
      @team = Team.create!(name: tracker.name, slug: slug, cloudinary_id: tracker.cloudinary_id, bio: tracker.description)
      TagRelation.create!(parent: @team, child: tracker.team).votes.create!(person: Person.find(7), value: 1) if tracker.team
      tracker.update_attributes(team: @team)
      render "api/v0/teams/show"
    end
  end

  def update
    
    if params[:add_child_team_inclusion]
      child_team = Team.where(slug: params[:add_child_team_inclusion]).first!
      @team.parent_team_activity_inclusions.where(child_team: child_team).first_or_create!
    end

    if params[:remove_child_team_inclusion]
      child_team = Team.where(slug: params[:remove_child_team_inclusion]).first!
      @team.parent_team_activity_inclusions.where(child_team: child_team).delete_all
    end


    if params.has_key?(:merge_with)
      begin
        @team = Team.merge!(@team, Team.find(params[:merge_with]))
        render "api/v0/teams/show"
        return
      rescue Exception => e
        render json: { error: e.inspect }, status: :unprocessable_entity
        return
      end
    end

    if params.has_key?(:add_member)
      person = Person.find(params[:add_member])
      @team.add_member(person, admin: false, developer: false, public: false, no_emails: true)
    end

    if params.has_key?(:remove_member)
      person = Person.find(params[:remove_member])
      relation = @team.relation_for_owner(person).destroy
    end

    if params.has_key?(:update_member)
      person = Person.find(params[:update_member])
      if params[:permission] == 'admin'
        @team.set_member_admin(person, params[:value].to_bool)
      elsif params[:permission] == 'developer'
        @team.set_member_developer(person, params[:value].to_bool)
      elsif params[:permission] == 'public'
        @team.set_member_public(person, params[:value].to_bool)
      elsif params[:permission] == 'member'
        @team.set_member_member(person, params[:value].to_bool)
      end
    end

    if params.has_key?(:add_trackers)
      params[:add_trackers].gsub(/ /,'').split(',').map(&:to_i).each do |tracker_id|
        @team.add_tracker(Tracker.find(tracker_id))
      end
    end

    if params.has_key?(:remove_tracker)
      @team.remove_tracker(Tracker.find(params[:remove_tracker]))
    end

    if params.has_key?(:remove_ownership)
      Tracker.find(params[:remove_ownership]).update_attributes!(team: nil)
    end

    if params.has_key?(:take_ownership)
      Tracker.find(params[:take_ownership]).update_attributes!(team: @team)
    end

    ApplicationRecord.transaction do
      @team.name = params[:name] if params.has_key?(:name)
      @team.slug = params[:slug] if params.has_key?(:slug)
      @team.image_url = params[:image_url] if params.has_key?(:image_url) && !params[:image_url].blank?
      @team.bio = params[:bio] if params.has_key?(:bio)
      @team.url = params[:url] if params.has_key?(:url)
      @team.accepts_public_payins = params[:accepts_public_payins].to_bool if params.has_key?(:accepts_public_payins)
      @team.accepts_issue_suggestions = params[:accepts_issue_suggestions].to_bool if params.has_key?(:accepts_issue_suggestions)
      @team.can_email_stargazers = params[:can_email_stargazers].to_bool if params.has_key?(:can_email_stargazers)
      @team.bounties_disabled = params[:bounties_disabled].to_bool if params.has_key?(:bounties_disabled)
      @team.featured = params[:featured].to_bool if params.has_key?(:featured)
      @team.homepage_featured = params[:homepage_featured].to_i > 0 ? params[:homepage_featured].to_i : nil if params.has_key?(:homepage_featured)

      @team.homepage_markdown = params[:homepage_markdown] if params.has_key?(:homepage_markdown)
      @team.new_issue_suggestion_markdown = params[:new_issue_suggestion_markdown] if params.has_key?(:new_issue_suggestion_markdown)
      @team.bounty_search_markdown = params[:bounty_search_markdown] if params.has_key?(:bounty_search_markdown)
      @team.resources_markdown = params[:resources_markdown] if params.has_key?(:resources_markdown)

      if params.has_key?(:linked_account_login)
        if params[:linked_account_login].blank?
          @team.linked_account = nil
        else
          preload = [LinkedAccount::Github::User, LinkedAccount::Github::Organization]
          @team.linked_account = LinkedAccount::Github.where(login: params[:linked_account_login]).first!
          Team.where(linked_account_id: @team.linked_account.id).where.not(id: @team.id).update_all(linked_account_id: nil)
        end
      end
      if @team.save
        render "api/v0/teams/show"
      else
        render json: { error: "Error: #{@team.errors.full_messages}" }, status: :unprocessable_entity
      end
    end

  end

  def destroy
    @team = Team.where(id: params[:id]).first!
    @team.safe_destroy!
    render json: true
  end

protected

  def require_team
    case params[:id]
      when /^\d+$/ then @team = Team.where(id: params[:id]).first
      else @team = Team.where(slug: params[:id]).first
    end
    unless @team
      render json: { error: 'Team not found' }, status: :not_found
    end
  end
end
