class Api::V2::IssueSuggestionsController < Api::BaseController

  before_action :require_auth, only: [:create, :update]
  before_action :require_issue_suggestion_admin, only: [:update]

  def create
    @team = Team.where(slug: params[:team]).first!

    issue_suggestion = @team.issue_suggestions.new(
      issue: Tracker.magically_turn_url_into_tracker_or_issue(params[:url]),
      description: params[:description],
      person: current_user,
      suggested_bounty_amount: params[:suggested_bounty_amount].to_f,
      can_solve: params[:can_solve].to_bool
    )

    if issue_suggestion.save
      render json: { success: true }
    else
      render json: { errors: issue_suggestion.errors.full_messages.join(", ") }
    end
  end

  def update
    if @issue_suggestion.thanked_at || @issue_suggestion.rejected_at
      render json: { errors: "Already responded" }
    elsif params[:thanked]
      @issue_suggestion.update_attributes(thanked_at: Time.now)
      @issue_suggestion.person.send_email(:issue_suggestion_thanked, issue_suggestion: @issue_suggestion)
      render json: { success: true }
    elsif params[:rejected]
      @issue_suggestion.update_attributes!(rejected_at: Time.now, rejection_reason: params[:rejection_reason])
      @issue_suggestion.person.send_email(:issue_suggestion_rejected, issue_suggestion: @issue_suggestion)
      render json: { success: true }
    end
  end

  def index

    if current_user
      # include teams you're an admin of, suggestions you created, and suggestions which are not rejected
      @collection = IssueSuggestion.where('rejected_at is null OR person_id = ? OR team_id in (?)', current_user.id, current_user.admin_team_ids)
    else
      @collection = IssueSuggestion.not_rejected
    end

    @collection.includes(:person, :team, :issue)

    if params[:team]
      @include_issue_team = true
      @include_issue_tracker = true

      @team = Team.where(slug: params[:team]).first!
      @collection = @collection.where('team_id' => @team.id)
    elsif params[:issue_id]
      @collection = @collection.where('issue_id' => params[:issue_id])
    end
  end

protected

  def require_issue_suggestion_admin
    @issue_suggestion = IssueSuggestion.where(id: params[:id], team_id: current_user.admin_team_ids).first!
  end

end
