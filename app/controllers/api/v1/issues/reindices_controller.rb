class Api::V1::Issues::ReindicesController < ApplicationController
  def create
    @issue = Issue.find(params[:issue_id])
    @issue.reindex
    render 'api/v1/issues/show'
  end
end
