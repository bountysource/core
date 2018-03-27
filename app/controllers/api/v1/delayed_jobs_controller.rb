class Api::V1::DelayedJobsController < ApplicationController
  def poll
    job = Delayed::Job.find_by_id(params[:id])
    head (job ? :not_modified : :ok)
  end
end
