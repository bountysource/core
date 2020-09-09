port ENV['PORT'] || 3000
environment ENV['RAILS_ENV'] || ENV['RACK_ENV'] || 'development'
workers Integer(ENV['PUMA_WORKERS'] || ENV['WEB_CONCURRENCY'] || 3)
threads_count = Integer(ENV['PUMA_THREADS'] || ENV['RAILS_MAX_THREADS'] || 3)
threads threads_count, threads_count

quiet

preload_app!

rackup      DefaultRackup

on_worker_boot do
  # Worker specific setup for Rails 4.1+
  # See: https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server#on-worker-boot
  ApplicationRecord.establish_connection
end
