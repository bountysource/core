source 'https://rubygems.org'

require 'net/http'
require 'net/https'
require 'uri'
require 'cgi'
require 'ostruct'
require 'csv'
require 'optparse'

ruby '2.4.3'

gem 'rails', '5.1.5'
gem 'json'
gem 'pg', '~> 0.18.1'
gem 'mysql2', '0.3.17'
gem 'puma'
gem 'rack-timeout'
gem 'oj'

gem 'rabl'
gem 'jbuilder'
gem 'bcrypt-ruby', '~> 3.1.2'
gem 'bcrypt', '3.1.10'
gem 'github-markdown', :require => 'github/markdown'

# Note: version 1.0.0 is totally broken, lock the version in at
# the last known working one.
gem 'jwt', '= 0.1.11' # for Google Wallet JWT creation
gem 'money'  # used to be included through the checkout gem

gem 'newrelic_rpm'

gem 'delayed_job_active_record'

gem 'api-versions'
gem 'aasm'
gem 'oauth'
gem 'date_validator'
gem 'nokogiri'
gem 'httparty'

gem 'cancan', '~> 1.6.10'

gem 'paper_trail'

gem 'stripe'

gem 'maildown'

gem 'htmlentities'

# Frontend
gem 'sass-rails', '~> 5.0.7'
gem 'bootstrap-sass'
gem 'savon', '~> 2.11', '>= 2.11.2'

gem 'thinking-sphinx'

gem 'flying-sphinx', '~> 1.0.0'

gem 'cloudinary'
gem 'eventmachine', '1.0.4'
gem 'em-http-request'
gem 'angular-rails-templates'

gem 'secure_headers'

group :development do
  gem 'zeus'
  gem 'foreman'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'rdoc'
  gem 'annotate', '~> 2.6.5'
end

group :development, :test do
  gem 'pry'
  gem 'byebug'
  gem 'fog'
  gem 'slack-notifier'
  gem 'git'
  gem 'octokit'
  gem 'dotenv-rails'
  gem 'faker'
end

group :test do
  gem 'rspec-rails'
  gem 'factory_girl_rails'
  # gem 'curb', require: false #At this stage, we are only using curb in a test
  gem 'capybara'
  gem 'thin'
  gem 'poltergeist'
  #Need to use simplecov 0.7.1 since it forces rspec to exit with an exit code of 0 even when tests fail.
  #Disabling for now since I don't think we use it
  #gem 'simplecov', '~> 0.7.1'
  gem 'cucumber-rails', :require => false
  # database_cleaner is not required, but highly recommended
  gem 'database_cleaner'
  gem 'poltergeist-suppressor'
  gem 'shoulda-matchers', require: false
  gem 'selenium-webdriver', '~> 2.42.0'
  gem 'launchy'
  gem 'vcr'
  gem 'webmock', '1.24.6'
  gem 'timecop'
  gem 'jshint', '1.5.0'
end

gem 'haml'

group :production do
  gem 'uglifier'
  gem 'asset_sync'
  gem 'execjs'
  gem 'therubyracer'
  gem 'ngannotate-rails'

end
