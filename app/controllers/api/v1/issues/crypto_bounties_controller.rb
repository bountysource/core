class Api::V1::Issues::CryptoBountiesController < ApplicationController
  def index
    @issue = Issue.find(params[:issue_id])
    unless @issue.issue_address.nil?
      CryptoApi.refresh_bounties(@issue.id)
    end
    @crypto_bounties = @issue.crypto_bounties
    render "api/v1/crypto_bounties/index"
  end
end
