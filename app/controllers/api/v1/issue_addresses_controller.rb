class Api::V1::IssueAddressesController < ApplicationController
  def create
    @issue = Issue.find(params[:issue_id])
    CryptoApi.generate_address(@issue.id) unless @issue.issue_address.present?
    @issue.reload
    @issue
  end
end