class Api::V0::DelayedJobsController < Api::V0::BaseController

  before_action :require_delayed_job, except: [:index, :info]

  def info
    if params[:group_stats]
      stats = ApplicationRecord.connection.select_all("
        select
          count(*) as count,
          object_type,
          attempted,
          method_name
        from (
          select
            replace(substring(substring(handler,'\nobject:.*?\n'),10),'\n','') as object_type,
            replace(substring(substring(handler,'\nmethod_name:.*?\n'),15),'\n','') as method_name,
            (case when attempts>0 then true else false end) as attempted
          from
            delayed_jobs
        ) as t
        group by
          object_type,
          method_name,
          attempted
        order by count desc
      ").to_a
    else
      stats = {
        new_jobs: Delayed::Job.where("locked_at is null and attempts = 0 and run_at <= now()").count,
        failed_jobs: Delayed::Job.where("attempts > 0").count,
        locked_jobs: Delayed::Job.where("locked_at is not null").count
      }
    end

    render json: stats
  end

  def index
    @delayed_jobs = Delayed::Job.order("created_at desc")
  end

  def show
  end

  def delete
    if @delayed_job.delete
      head :accepted
    else
      render json: { error: @delayed_job.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end
  end

  def perform
    handler = YAML.load(@delayed_job.handler)
    handler.perform rescue nil

    # if the job is still there, failure!
    begin
      @delayed_job.reload
      render "api/v0/delayed_jobs/show", status: :bad_request
    rescue ActiveRecord::RecordNotFound
      head :accepted
    end
  end

protected

  def require_delayed_job
    unless (@delayed_job = Delayed::Job.find_by_id(params[:id]))
      render json: { error: "Delayed::Job not found" }, status: :not_found
    end
  end
end
