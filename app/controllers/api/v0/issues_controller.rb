class Api::V0::IssuesController < Api::V0::BaseController

  before_action :require_issue, only: [:show, :update]

  def index
    @issues = Issue.order('created_at desc')
    render "api/v1/issues/index"
  end

  def show
    render "api/v0/issues/show"
  end

  def update
    @issue.featured = params[:featured].to_bool if params.has_key?(:featured)

    if @issue.save
      render "api/v1/issues/show"
    else
      render json: { error: @issue.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def recent
    @issues = Issue.order('created_at desc').limit(30)
    render "api/v1/issues/index"
  end

  def closed_with_bounty
    @issues = Issue.closed_with_bounty
    render "api/v1/issues/index"
  end

  def waiting_for_developer
    @issues = Issue.waiting_for_developer
    render "api/v1/issues/waiting_for_developer"
  end

  def closed
    @issues = Issue.includes(:tracker, :bounties).where("issues.bounty_total > 0 AND paid_out = false AND can_add_bounty = false").references(:issues)
    render "api/v0/issues/index"
  end

  def open
    @issues = Issue.includes(:tracker, :bounties).where("issues.bounty_total > 0 AND paid_out = false AND can_add_bounty = true").references(:issues)
    render "api/v0/issues/index"
  end

  def paid_out
    @issues = Issue.includes(:tracker, :bounties).where(paid_out: true)
    render "api/v0/issues/index"
  end

  def counts
    @closed = Issue.where("issues.bounty_total > 0 AND paid_out = false AND can_add_bounty = false").references(:issues).count
    @open = Issue.where("issues.bounty_total > 0 AND paid_out = false AND can_add_bounty = true").references(:issues).count
    @paid_out = Issue.where(paid_out: true).count
  end

protected

  def require_issue
    unless (@issue = Issue.find_by_id params[:id])
      render json: { error: 'Issue not found' }, status: :not_found
    end
  end
end
