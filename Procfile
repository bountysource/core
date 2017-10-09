release: rake db:migrate
web: puma -C /app/config/puma.rb
worker: bundle exec rake jobs:work
