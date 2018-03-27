class Api::V1::ProjectsController < ApplicationController
  before_action :require_project, only: [:issues]

  def issues
    if @project.is_a?(Github::Repository)
      @issues = @project.issues.includes(:author, :solutions).where("issues.can_add_bounty = ? OR issues.bounty_total > ? OR issues.paid_out = ?", true, 0, true).
                order("issues.bounty_total desc, issues.comment_count desc")
    else
      @issues = @project.issues.where("issues.can_add_bounty = ? OR issues.bounty_total > ?", true, 0).references(:issues).order("issues.bounty_total desc, issues.comment_count desc")
    end
  end

protected

  def require_project
    unless (@project = Tracker.find_by_id params[:id])
      render json: { error: "Project not found" }, status: :not_found
    end
  end
end
