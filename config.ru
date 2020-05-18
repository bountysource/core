# This file is used by Rack-based servers to start the application.
require ::File.expand_path('../config/environment',  __FILE__)

require "rack/attack"
use Rack::Attack

run Rails.application
