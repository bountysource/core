class Api::BaseController < ActionController::Base
  include RequestTracking

  # TODO: make this work without lots of browser console errors
  # ensure_security_headers

  # do this before JSONP callback wrapper so head(:ok) runs
  before_action :set_access_control_headers
  before_action :set_default_response_format
  before_action :set_do_not_cache_headers

  around_action :handle_errors

  class MissingRequiredParameters < StandardError ; end

  def not_acceptable
    render json: {
      error: "Content type not acceptable: #{request.headers['Accept']}",
      suggestion: "Try application/vnd.bountysource+json; version=2"
    }, status: 406
  end

  def current_user
    @current_user ||= ::Person.find_by_access_token(params[:access_token]) if params[:access_token]
    @current_user ||= ::Person.find_by_access_token(request.headers['HTTP_AUTHORIZATION'].split(' ').last) if request.headers['HTTP_AUTHORIZATION'] =~ /^token /
    @current_user
  end

protected

  def user_for_paper_trail
    nil
  end

  def info_for_paper_trail
    { remote_ip: request.remote_ip, user_agent: request.user_agent, person_id: current_user.try(:id) }
  end

  def handle_errors
    yield

  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Not found' }, status: :not_found

  rescue CanCan::AccessDenied
    render json: { error: 'Unauthorized' }, status: :unauthorized

  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.message }, status: :unprocessable_entity

  rescue MissingRequiredParameters => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def set_access_control_headers
    if self.class.name.starts_with?('Api::')
      # copied from api.github.com
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE'
      headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With'
      headers['Access-Control-Expose-Headers'] = "Link, Total-Pages, Total-Items"
      headers['Access-Control-Max-Age'] = '86400'

      # OPTIONS immediately return 200 with empty body
      head(:ok) if request.request_method == "OPTIONS"
    end
  end

  def set_do_not_cache_headers
    headers['Cache-Control'] = "no-cache, no-store, max-age=0, must-revalidate"
    headers['Pragma'] = "no-cache"
    headers['Expires'] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

  def set_default_response_format
    request.format = :json
  end

  def require_auth
    current_user.present? or
      raise CanCan::AccessDenied
  end

  def require_params(*keys)
    missing_params = keys.reject { |k| params.has_key?(k) && !params[k].blank? }
    unless missing_params.empty?
      raise MissingRequiredParameters, "Missing required parameters: #{missing_params.map(&:to_s).join(', ')}"
    end
  end

  def self.log_activity(name, options = {})
    Proc.new {
      #request object cannnot be passed into method. hack to break it into strings
      request_info = {}
      request_info["HTTP_USER_AGENT"] = request.env["HTTP_USER_AGENT"].to_s
      request_info["remote_ip"] = request.env["action_dispatch.remote_ip"].to_s

      if @item.is_a?(Issue)
        options[:issue_id] = @item.id
        options[:tracker_id] = @item.tracker_id
      elsif @item.is_a?(Tracker)
        options[:tracker_id] = @item.id
      end
      options[:person_id] = current_user.try(:id)
      ActivityLog.delay.log(name, request_info, options)
    }
  end

end
