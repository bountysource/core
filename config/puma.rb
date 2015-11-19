port 3000
workers Integer(ENV['PUMA_WORKERS'] || 0)
threads_count = Integer(ENV['PUMA_THREADS'] || 1)
threads threads_count, threads_count

quiet

preload_app!

rackup      DefaultRackup

on_worker_boot do
  # Worker specific setup for Rails 4.1+
  # See: https://devcenter.heroku.com/articles/deploying-rails-applications-with-the-puma-web-server#on-worker-boot
  ActiveRecord::Base.establish_connection
end
