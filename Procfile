release: rake db:migrate
web: puma -C /app/config/puma.rb
worker: NEW_RELIC_DISPATCHER=delayed_job bundle exec rake jobs:work
