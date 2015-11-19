class Api::V1::DelayedJobsController < ApplicationController
  def poll
    job = Delayed::Job.find_by_id(params[:id])
    render nothing: true, status: (job ? :not_modified : :ok)
  end
end
