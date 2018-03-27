class Api::V2::ProposalsController < Api::BaseController
  include CurrencyConversion
  include RequestForProposalAuthorization

  before_action :require_auth
  before_action :require_team_admin_or_developer, except: [:create, :destroy, :show]
  before_action :require_proposal_owner, only: [:destroy]
  before_action :parse_options

  # Proposal#accept! and Proposal#reject! raise this
  # exception on invalid state change.
  rescue_from AASM::InvalidTransition do |e|
    ::NewRelic::Agent.notice_error(e)
    head :bad_request
  end

  def create
    @item = request_for_proposal.proposals.create!(
      person: current_user,
      amount: amount,
      estimated_work: params[:estimated_work],
      completed_by: params[:completed_by],
      bio: params[:bio]
    )
    render 'api/v2/proposals/create', status: :created
  end

  def destroy
    proposal.destroy!
    head :no_content
  end

  def index
    @collection = request_for_proposal.proposals
  end

  def accept
    proposal.begin_appointment!

    # Save optional notes from Team member on appointment on Proposal
    proposal.set_team_notes!(params[:team_notes]) if params.has_key?(:team_notes)

    head :ok
  end

  def reject
    proposal.reject!

    # Save optional notes from Team member on appointment on Proposal
    proposal.set_team_notes!(params[:team_notes]) if params.has_key?(:team_notes)

    head :ok
  end

  def show
    @item = proposal
  end

  private

  def parse_options
    @include_person = params[:include_person].to_bool
    @include_request_for_proposal = params[:include_request_for_proposal].to_bool
  end

  # Return the authenticated user's Proposal if request, or search by id if the user is authenticated.
  def proposal
    @proposal ||= begin
      if params[:id] == "mine" && current_user
        request_for_proposal.proposals.find_by!(person: current_user)
      else
        require_team_admin_or_developer
        request_for_proposal.proposals.find_by!(id: params[:id])
      end
    end
  end

  def require_proposal_owner
    proposal.person == current_user or
      raise CanCan::AccessDenied
  end

  # Parse amount from :amount and :currency
  def amount
    @amount ||= currency_convert(params[:amount], params[:currency], 'USD')
  end
end
