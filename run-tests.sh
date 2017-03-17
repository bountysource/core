#!/bin/bash

/app/bin/rake db:drop db:create spec:prepare
/app/bin/bundle exec rspec --pattern spec/models{,/**}/*_spec.rb
/app/bin/rake db:drop db:create spec:prepare
/app/bin/bundle exec rspec --pattern spec/trackers{,/**}/*_spec.rb
/app/bin/rake db:drop db:create spec:prepare
/app/bin/bundle exec rspec --pattern spec/{controllers,features,helpers,mailers,routing}{,/**}/*_spec.rb
/app/bin/rake jshint
