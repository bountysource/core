class Crontab

  def self.run(&block)
    return if Rails.env.test?
    return unless (Delayed::Job.columns rescue nil)

    @jobs = {}
    instance_eval(&block)

    Delayed::Job.transaction do
      all_jobs = Delayed::Job.where(queue: 'crontab').to_a

      @jobs.each do |command, interval|
        job = all_jobs.find do |job|
          parsed = YAML.load(job.handler)
          job if parsed.args.first == command && job.run_at <= interval.from_now
        end

        if job
          # remove it from the array so we don't delete_all it
          all_jobs.delete(job)
        else
          Crontab.delay(queue: 'crontab', run_at: interval.from_now).execute(command)
        end
      end

      # removing any remaining jobs
      Delayed::Job.where(id: all_jobs.map(&:id)).delete_all unless all_jobs.empty?
    end
  end

  def self.every(interval, command)
    @jobs[command] = interval
  end

  def self.execute(command)
    if !@jobs[command]
      Rails.logger.info "[CRONTAB] skipping unknown command: #{command}"
    else
      begin
        Rails.logger.info "[CRONTAB] running: #{command}"
        eval(command)
      rescue Exception => exception
        NewRelic::Agent.notice_error(exception)
        Rails.logger.info "[CRONTAB] Exception running #{command}: #{exception.inspect}"
      ensure
        Crontab.delay(queue: 'crontab', run_at: @jobs[command].from_now).execute(command)
      end
    end
  end

end