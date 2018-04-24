class Api::V1::Issues::IssueAddressesController < ApplicationController
  def create
    @issue = Issue.find(params[:issue_id])
    address = CryptoApi.generate_address(@issue.id)
  end
end