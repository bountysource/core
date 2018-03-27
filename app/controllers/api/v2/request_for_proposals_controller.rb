class Api::V2::RequestForProposalsController < Api::BaseController
  include CurrencyConversion
  include RequestForProposalAuthorization

  before_action :parse_options
  before_action :require_auth, except: [:show]
  before_action :require_team_admin_or_developer, except: [:show]

  def show
    @item = request_for_proposal
  end

  def create
    @item = issue.create_request_for_proposal!(
      person:   current_user,
      budget:   budget,
      due_date: params[:due_date],
      abstract: params[:abstract]
    )
    render 'api/v2/request_for_proposals/create', status: :created
  end

  def update
    request_for_proposal.budget = params[:budget] if params.has_key?(:budget)
    request_for_proposal.due_date = params[:due_date] if params.has_key?(:due_date)
    request_for_proposal.abstract = params[:abstract] if params.has_key?(:abstract)
    request_for_proposal.save!
    @item = request_for_proposal
  end

  def destroy
    request_for_proposal.destroy!
    head :no_content
  end

private

  def parse_options
    @include_issue = !!params[:include_issue]
    @include_team = !!params[:include_team]
  end

  def budget
    @budget ||= currency_convert(params[:budget], params[:currency], 'USD')
  end
end
