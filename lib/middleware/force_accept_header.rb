
# This is a fix for the api-versions gem. In the current 1.2 release, it k-splodes when there is no accept header present.
module ForceAcceptHeader
  class Middleware
    def initialize(app)
      @app = app
    end

    def call(env)
      env['HTTP_ACCEPT'] ||= ""
      @app.call(env)
    end
  end
end

