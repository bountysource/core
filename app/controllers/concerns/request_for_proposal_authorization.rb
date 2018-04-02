module RequestForProposalAuthorization
  extend ActiveSupport::Concern

  included do
    before_action :require_issue
  end

  private

  def issue
    @issue ||= Issue.find_by!(id: params[:issue_id])
  end

  def require_issue
    issue
  end

  def request_for_proposal
    @request_for_proposal ||= issue.request_for_proposal or raise ActiveRecord::RecordNotFound
  end

  # Person member of team that owns issue
  def require_team_admin_or_developer
    issue.team && issue.team.rfp_enabled? &&
      (issue.team.person_is_admin?(current_user) || issue.team.person_is_developer?(current_user)) or
      raise CanCan::AccessDenied
  end
end
