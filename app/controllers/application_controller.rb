class ApplicationController < ActionController::Base
  include RequestTracking
  #protect_from_forgery

  # TODO: make this work without lots of browser console errors
  # ensure_security_headers

  # do this before JSONP callback wrapper so head(:ok) runs
  before_filter :set_access_control_headers
  before_filter :set_do_not_cache_headers

  # allow JSONP callback parameter
  around_filter :response_to_jsonp

  after_filter :update_person_last_seen_at

  before_filter :find_person

  before_filter do
    # default per page
    params[:per_page] ||= 50
  end

  class Error < StandardError ; end
  class UnauthorizedError < Error ; end
  class Redirect < Error ; end

  class MissingRequiredParams < StandardError
    attr_accessor :params
    def initialize(*params)
      @params = params
    end
  end

protected

  def authenticate_full_site_password
    unless ENV['BOUNTYSOURCE_FULL_SITE_PASSWORD'].blank?
      unless authenticate_with_http_basic { |user, password| password == ENV['BOUNTYSOURCE_FULL_SITE_PASSWORD'] }
        request_http_basic_authentication
      end
    end
  end

  def set_access_control_headers
    if self.class.name.starts_with?('Api::')
      # copied from api.github.com
      headers['Access-Control-Allow-Origin'] = '*'
      headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE'
      headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With'
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

  # CanCan method to get the current user.
  def current_user
    @current_user ||= Person.find_by_access_token(params[:access_token])
  end

  def self.require_tracker(key, options={})
    Proc.new {
      @tracker = Tracker.find_with_merge(params[key], relation: Tracker.not_deleted)
      @tracker.remote_sync_if_necessary(state: "open", person: @person)
    }
  end

  def self.require_issue(key, options={})
    Proc.new {
      @issue = Issue.find_with_merge(params[key], relation: Issue.not_deleted)
      @issue.remote_sync_if_necessary(person: @person)
    }
  end

  def self.log_activity(name, options = {})
    Proc.new {
      #request object cannnot be passed into method. hack to break it into strings
      request_info = {}
      request_info["HTTP_USER_AGENT"] = request.env["HTTP_USER_AGENT"].to_s
      request_info["remote_ip"] = request.env["action_dispatch.remote_ip"].to_s

      options[:issue_id] = @issue.try(:id) || params[:item_number]
      options[:tracker_id] = @tracker.try(:id) || @item.try(:id) || @issue.tracker.id #use item for follow_relations controller
      options[:person_id] = @person.try(:id)
      ActivityLog.delay.log(name, request_info, options)
    }
  end

  def render_rabl_template(object, view)
    JSON.parse Rabl.render(object, view, view_path: 'app/views', format: :json)
  end

  def response_to_jsonp
    yield
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Not found" }, status: :not_found
  rescue UnauthorizedError
    render json: { error: "Invalid or missing access token" }, status: :unauthorized
  rescue MissingRequiredParams => e
    render json: { error: "Missing required fields: #{e.params.map(&:to_s).map(&:humanize).join(', ')}", params: e.params.flatten }, status: :unprocessable_entity
  rescue CanCan::AccessDenied => e
    render json: { error: e.message }, status: :unauthorized
  rescue Redirect => e
    # Put redirect URL on response body instead of Location header.
    # The frontend should perform the redirect on it's own
    response.status = 302

    response.body = { message: "Content moved", url: e.message }.to_json

  rescue => e
    # Raise the expection when in test or dev environments
    raise e if Rails.env.test? || Rails.env.development?

    # Uncaught exception! Set status to 500 and render special message.
    response.status = 500
    response.body = { error: "Internal server error." }.to_json

    # Manually log error in New Relic
    ::NewRelic::Agent.notice_error(e)

    logger.error "\n\tCaught unhandled exception!\n\t#{e.class}: #{e.message}\n"
    logger.error "#{e.backtrace.join("\n")}\n"
  ensure
    if params[:callback] =~ /\A[A-Za-z0-9_\.\[\]\$'"]+\Z/
      response.content_type = 'application/javascript'
      response.body = "/**/ #{params[:callback]}(#{{
        data: (JSON.parse(response.body) rescue nil),
        meta: {
          status:     response.status,
          success:    (200...300).include?(response.status.to_i),
          pagination: (JSON.parse(response.headers['Pagination']) rescue nil)
        }
      }.to_json})"
      response.status = :ok # since !200 breaks JSONP
    end
  end

  def require_params(*keys)
    missing_params = keys.reject { |k| params.has_key?(k) && !params[k].blank? }
    raise MissingRequiredParams.new missing_params unless missing_params.empty?
  end

  def require_auth
    raise UnauthorizedError unless @person
  end

  def find_person
    @person ||= if request.headers['HTTP_AUTHORIZATION'] =~ /^token /
      Person.find_by_access_token(request.headers['HTTP_AUTHORIZATION'].split(' ').last)
    elsif !params[:access_token].blank?
      Person.find_by_access_token(params[:access_token])
    elsif !params[:email].blank? && !params[:password].blank?
      Person.authenticate(params[:email], params[:password])
    end
  end

  def update_person_last_seen_at
    @person.was_seen! if @person
  end

  def user_for_paper_trail
    nil
  end

  def info_for_paper_trail
    { remote_ip: request.remote_ip, user_agent: request.user_agent, person_id: find_person.try(:id) }
  end

end
