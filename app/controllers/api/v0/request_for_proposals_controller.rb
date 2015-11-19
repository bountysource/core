class Api::V0::RequestForProposalsController < Api::V0::BaseController
  def index
    @include_person = true
    @collection = RequestForProposal.includes(:proposals, :person, :issue)
  end
end