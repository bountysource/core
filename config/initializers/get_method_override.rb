# for legacy purposes, we allow GET requests to specify a `_method=POST` param
Rack::MethodOverride::ALLOWED_METHODS.push('GET')

module MethodOverrideViaGetParam
  def method_override_param(req)
    req.GET[Rack::MethodOverride::METHOD_OVERRIDE_PARAM_KEY] || super
  end
end
Rack::MethodOverride.prepend(MethodOverrideViaGetParam)
