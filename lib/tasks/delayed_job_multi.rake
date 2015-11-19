# MONKEYPATCH FOR https://github.com/collectiveidea/delayed_job/pull/565
Rake::Task["jobs:work"].clear
Rake::Task["jobs:environment_options"].clear
namespace :jobs do
  task :environment_options => :environment do
    @worker_options = {
      :min_priority => ENV['MIN_PRIORITY'],
      :max_priority => ENV['MAX_PRIORITY'],
      :queues => (ENV['QUEUES'] || ENV['QUEUE'] || '').split(','),
      :quiet => false,
      :num_processes => ENV['NUM_PROCESSES'] ? ENV['NUM_PROCESSES'].to_i : 1
    }
  end

  desc "Start a delayed_job worker."
  task :work => :environment_options do
    if @worker_options[:num_processes] == 1
      Delayed::Worker.new(@worker_options).start
    else
      Delayed::Worker.before_fork
      @worker_options[:num_processes].times do |worker_index|
        fork do
          Delayed::Worker.after_fork
          worker = Delayed::Worker.new(@worker_options)
          worker.name_prefix = "delayed_job.#{worker_index} "
          worker.start
        end
      end
      sleep
    end
  end
end
