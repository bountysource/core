# Load the rails application
require File.expand_path('../application', __FILE__)
require 'display_money'
#require 'heroku_timeout'

# Initialize the rails application
Api::Application.initialize!
