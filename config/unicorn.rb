# config/unicorn.rb
port ENV['PORT'] || 3000
environment ENV['RAILS_ENV'] || ENV['RACK_ENV'] || 'development'
workers Integer(ENV['PUMA_WORKERS'] || ENV['WEB_CONCURRENCY'] || 0)
threads_count = Integer(ENV['PUMA_THREADS'] || ENV['RAILS_MAX_THREADS'] || 1)
threads threads_count, threads_count

quiet

worker_processes Integer(ENV["WEB_CONCURRENCY"] || 3)
timeout 15
preload_app true

rackup      DefaultRackup

on_worker_boot do
  # Worker specific setup for Rails 4.1+
  # See: https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server#on-worker-boot
  ApplicationRecord.establish_connection
end

before_fork do |server, worker|
  Signal.trap 'TERM' do
    puts 'Unicorn master intercepting TERM and sending myself QUIT instead'
    Process.kill 'QUIT', Process.pid
  end

  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.connection.disconnect!
end

after_fork do |server, worker|
  Signal.trap 'TERM' do
    puts 'Unicorn worker intercepting TERM and doing nothing. Wait for master to send QUIT'
  end

  defined?(ActiveRecord::Base) and
    ActiveRecord::Base.establish_connection
end




