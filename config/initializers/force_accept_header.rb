require 'rails/railtie'
require Rails.root.join("lib", "middleware", "force_accept_header")

# We need to do this to fix for a bug in the api-versions gem where it k-splodes when there is a blank accept header passed.
module ForceAcceptHeader
  class Railtie < Rails::Railtie
    config.app_middleware.use ForceAcceptHeader::Middleware
  end
end


