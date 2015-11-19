# based from rack-1.3.2 methodoverride.rb

class GetMethodOverride
  HTTP_METHODS = %w(GET HEAD PUT POST DELETE OPTIONS PATCH)
  METHOD_OVERRIDE_PARAM_KEY = "_method".freeze
  HTTP_METHOD_OVERRIDE_HEADER = "HTTP_X_HTTP_METHOD_OVERRIDE".freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    req = Rack::Request.new(env)
    method = req.POST[METHOD_OVERRIDE_PARAM_KEY] || req.GET[METHOD_OVERRIDE_PARAM_KEY] || env[HTTP_METHOD_OVERRIDE_HEADER]
    method = method.to_s.upcase
    if HTTP_METHODS.include?(method)
      env["rack.methodoverride.original_method"] = env["REQUEST_METHOD"]
      env["REQUEST_METHOD"] = method
    end

    @app.call(env)
  end
end
