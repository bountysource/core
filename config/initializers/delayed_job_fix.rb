# https://github.com/collectiveidea/delayed_job/issues/790
Delayed::Worker.class_eval do
  def handle_failed_job(job, error)
    job.last_error = "#{error.message}\n#{error.backtrace.join("\n")}".encode('UTF-8', :invalid => :replace, :undef => :replace)
    job_say job, "FAILED (#{job.attempts} prior attempts) with #{error.class.name}: #{error.message}", 'error'
    reschedule(job)
  end
end
