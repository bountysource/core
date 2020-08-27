release: rake db:migrate
web: bundle exec unicorn -p $PORT -c ./config/unicorn.rb
worker: NEW_RELIC_DISPATCHER=delayed_job bundle exec rake jobs:work
firehose: rails runner 'Github::Event.firehose!'
