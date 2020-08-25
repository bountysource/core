# This file is used by Rack-based servers to start the application.
require ::File.expand_path('../config/environment',  __FILE__)

run Api::Application

use Rack::Cors do
    allow do
      origins '*', '*',
              # regular expressions can be used here
  
      resource '*',
          methods: [:get, :post, :delete, :put, :patch, :options, :head],
          max_age: 600
          # headers to expose
    end