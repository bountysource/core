class Api::V0::IssueAddressesController < Api::V0::BaseController

  include Api::V2::PaginationHelper

  def show
    @issue_address = IssueAddress.find(params[:id])
    @crypto_bounties = @issue_address.issue.crypto_bounties
    render "api/v0/issue_addresses/show"
  end

  def index
    @issue_addresses = IssueAddress.all.includes(:issue).order(created_at: :desc)
    @issue_addresses = paginate!(@issue_addresses)
    render "api/v0/issue_addresses/index"
  end
end
