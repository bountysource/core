source 'https://rubygems.org'

require 'net/http'
require 'net/https'
require 'uri'
require 'cgi'
require 'ostruct'
require 'csv'
require 'optparse'

ruby '2.1.2'

gem 'dotenv-rails', groups: [:development, :test]

gem 'rails', '4.0.13'
gem 'json', '1.8.1'
gem 'pg', '~> 0.18.1'
gem 'mysql2', '0.3.14'
gem 'puma'
gem 'rack-timeout'
gem 'oj'
gem 'protected_attributes' # TODO: switch to strong_parameters

gem 'rabl'
gem 'jbuilder'
gem 'bcrypt-ruby', '~> 3.1.2'
gem 'github-markdown', :require => 'github/markdown'

# Note: version 1.0.0 is totally broken, lock the version in at
# the last known working one.
gem 'jwt', '= 0.1.11' # for Google Wallet JWT creation
gem 'money', '~> 5.1.1' # used to be included through the checkout gem

gem 'newrelic_rpm', '~> 3.8.0.218'

gem 'delayed_job_active_record'

gem 'api-versions'
gem 'aasm'
gem 'oauth'
gem 'date_validator'
gem 'nokogiri'
gem 'httparty'

gem 'cancan', '~> 1.6.10'

gem 'paper_trail', '~> 3.0.6'

gem 'stripe'

gem 'maildown'

gem 'htmlentities'


# Unfortunately, the new version of TS does not play nicely with Heroku, see:
# http://support.flying-sphinx.com/discussions/problems/1177-heroku-error-when-deploying-thinking-sphinx-gem-304-no-such-file-or-directory-tmpbuild_xxxlog
# tl;dr Heroku kills thew log directory, and TS relies on it's existence.
#
# The commit making it work with Heroku:
# https://github.com/pat/thinking-sphinx/commit/9b7a6f65245a40e60109b0cdeaec06ffee0751ff
#   "It'd be nice to rely on the log directory always existing, but sadly this is not the
#   case on Heroku (at least, not consistently). So, if it is there, the expanded path (avoiding
#   linked directories) will be used, but otherwise, we don't really care."
gem 'thinking-sphinx', '~> 3.1.0',
    :git    => 'git://github.com/pat/thinking-sphinx.git',
    :branch => 'develop',
    :ref    => 'c82ccdbe12'

gem 'flying-sphinx', '~> 1.0.0'

gem 'cloudinary'
gem 'eventmachine'
gem 'em-http-request'
gem 'angular-rails-templates'

gem 'secure_headers'

gem 'paypal-sdk-rest'

group :development do
  gem 'zeus'
  gem 'foreman'
  gem 'better_errors'
  gem 'binding_of_caller'
  gem 'rdoc'
  gem 'sql-logging'
  gem 'annotate', '~> 2.6.5'
end

group :development, :test do
  gem 'rspec-rails', '~> 3.2.0'
  gem 'pry'
  gem 'byebug'
  gem 'fog'
  gem 'slack-notifier'
  gem 'git'
  gem 'octokit'
end

group :test do
  gem 'factory_girl_rails'
  gem 'curb', require: false #At this stage, we are only using curb in a test
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
  gem 'webmock'
  gem 'timecop'
  gem 'dotenv-rails'
  gem 'jshint'
end

gem 'haml'

group :staging, :production do
  gem 'uglifier'
  gem 'asset_sync'
  gem 'execjs'
  gem 'therubyracer'
  gem 'ngannotate-rails'
  gem 'sass-rails', '~> 4.0.0'
end
