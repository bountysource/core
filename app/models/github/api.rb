module Github::API
  class Error < StandardError
    attr_reader :response
    def initialize(msg=nil, attrs={})
      @response = attrs[:response]
      super(msg)
    end
  end
  class Unauthorized < Error ; end
  class NotFound < Error ; end
  class RateLimitExceeded < Error ; end
  class UnprocessableEntity < Error ; end
  class Forbidden < Error ; end

  def self.needs_html_to_extract?
    false
  end

  def self.extract_info_from_url(url)
    Github::Issue.extract_from_url(url) || Github::Repository.extract_from_url(url)
  end

  def self.call(options={})
    # Raise when a test tries to invoke the API without explicitly requesting live API
    if !ENV['LIVE_API'] && Rails.env.test?
      raise Error, "Tried to invoke Github API from a test -- #{options.inspect}"
    end

    # build the HTTP request object
    response = self.send_request(build_request_from_options(options), options)

    if response.success?
      new_relic_data_point "Custom/external_api/github/success"
      return response

    elsif response.move_permanently? && (options[:type] || 'get').downcase == 'get' && options[:url].match(%r{\A/repos/([a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+)}) && (new_repo = check_for_moved_repo($1))
        Rails.logger.error "Retrying GET for renamed repo: #{$1} --> #{new_repo}"
        return call(options.merge(url: options[:url].gsub($1, new_repo)))

    elsif response.not_found?
      if (options[:type] || 'get').downcase == 'get' && options[:url].match(%r{\A/repos/([a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+)}) && (new_repo = check_for_moved_repo($1))
        Rails.logger.error "Retrying GET for renamed repo: #{$1} --> #{new_repo}"
        return call(options.merge(url: options[:url].gsub($1, new_repo)))
      else
        raise NotFound.new("Not found - #{options.inspect}", response: response)
      end

    elsif response.unprocessable?
      raise UnprocessableEntity.new("Unprocessable entity -- #{options.inspect}", response: response)

    elsif response.forbidden?
      raise Forbidden.new("Forbidden -- #{options.inspect}", response: response)

    elsif response.unauthorized?
      raise Unauthorized.new("Unauthorized -- #{options.inspect}", response: response)

    elsif response.rate_limited?
      new_relic_data_point "Custom/external_api/github/failure"
      raise RateLimitExceeded.new("Exceeded rate limit -- #{options.inspect}", response: response)

    else
      new_relic_data_point "Custom/external_api/github/failure"
      raise Error.new("Unknown error ##{response.status} -- #{options.inspect}", response: response)
    end

  end

  # given 'twitter/bootstrap' returns 'twbs/bootstrap'
  def self.check_for_moved_repo(full_name)
    uri = URI.parse("https://github.com/#{full_name}")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE
    request = Net::HTTP::Get.new(uri.path)
    response = http.request(request)

    if response.code.to_i == 301
      response.header['Location'].gsub('https://github.com/','')
    end
  end

  def self.rate_limit
    call(url: '/rate_limit').data
  end

private

  # build an HTTP response from options hash
  def self.build_request_from_options(options)
    options[:url] ||= "/"

    # build params. parse query string from request url. strips query string off of request URL
    request_params = (options[:params]||{}).with_indifferent_access
    options[:url], query_string = options[:url].split('?')
    request_params.merge! Rack::Utils.parse_nested_query query_string if query_string

    # default to 100 per page if page is specified
    request_params[:per_page] ||= 100 if request_params[:page]

    # merge in our app's credentials
    request_params.merge!(
      client_id:      Api::Application.config.github_api[:client_id],
      client_secret:  Api::Application.config.github_api[:client_secret]
    )

    # ignore blank params
    request_params.reject! { |k,v| v.nil? || v == '' }   # wanted to use .blank? but that would reject "false" as well (false.blank? == true)

    # append the request_params object to request URL
    options[:url] += "?#{request_params.to_param}" unless request_params.empty?

    # build request object
    klass = "Net::HTTP::#{(options[:type] || 'Get').capitalize}".constantize
    request = options[:data] ? klass.new(options[:url], options[:data]) : klass.new(options[:url])

    # add body
    request.body = options[:body].to_json if options[:body]

    # add request headers and defaults
    options[:headers] ||= {}
    options[:headers]['Accept'] ||= 'application/vnd.github.full+json'   # full = raw + html]
    options[:headers].each { |k,v| request[k] = v }

    request
  end

  # wrap logging around the request. returns the request object
  # TODO make it always return response struct
  def self.send_request(http_request, options={}, &block)
    uri = URI.parse(options[:host] || "https://api.github.com")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.verify_mode = OpenSSL::SSL::VERIFY_NONE

    options[:type] ||= 'GET'

    # log + make API request
    Rails.logger.debug("GITHUB API CALL: #{(options[:type])} #{options[:url]}\n - PARAMS: #{options[:params]}\n - BODY: #{options[:body]}\n - HEADERS: #{options[:headers]}")

    http_response = if options[:dry_run]
      Rails.logger.debug("DRY RUN OLNY")
      response = Net::HTTPResponse.new(1.0, 200, "OK")
      response.class_eval do
        def body
          ""
        end
      end
      response
    else
      http.request(http_request)
    end

    response = Response[http_request, http_response, options]

    yield(response) if block

    Rails.logger.debug("GITHUB CALLS LEFT: #{response.rate_limit.remaining} of #{response.rate_limit.total}")
    Rails.logger.debug("GITHUB API RESPONSE:\n#{response.data}")
    Rails.logger.debug("GITHUB API SCOPE: #{response.scopes}")

    response
  end

  # build a more useful response object out of raw data
  class Response < Struct.new(:http_request, :http_response, :options)
    attr_accessor :data, :link, :pages, :rate_limit, :status

    def data
      @data ||= begin
        # if response body is empty, determine whether or not to return an empty array, or empty hash
        data = if http_response.body.blank?
          case self.http_request.path
            when /(?:issues|comments|events)(?:\?.*)?$/ then []
            else {}
          end
        else
          JSON.parse(http_response.body)
          # begin
          #   JSON.parse(http_response.body)
          # rescue JSON::ParserError
          #   # bad response.. maybe it's url-encoded?
          #   Rack::Utils.parse_query(http_response.body)http_response.body.from
          # end
        end
        data.is_a?(Hash) ? data.with_indifferent_access : data
      end
    end

    def body
      http_response.body
    end

    def headers
      http_response.instance_variable_get("@header")
    end

    def link
      @link ||= begin
        url_map = {}
        (http_response['link']||'').split(',').each do |link|
          url, rel = link.split(';')
          url = url.strip.send(:[], 1..-2)
          rel = rel.match(/rel=["']?(\w+)["']?/)[1]
          url_map[rel] = url
        end
        url_map.with_indifferent_access
      end
    end

    def pages
      @pages ||= begin
        if link[:last]
          # pull the total number of pages from the
          query_params = Rack::Utils.parse_nested_query(link[:last].split('?').last)
          num_pages = query_params['page'].to_i
          num_pages.times.map { |page_num| "#{link[:last].split('?').first}?#{query_params.merge('page' => page_num+1).to_param}" }
        else
          []
        end
      end
    end

    def status
      @status ||= http_response.code.to_i
    end

    def success?
      (99...400).include?(status) && status != 301
    end

    def move_permanently?
      status == 301
    end

    def not_found?
      [404, 410].include?(status)
    end

    def modified?
      return nil unless success?
      status != 304
    end

    def unauthorized?
      status == 401
    end

    def unprocessable?
      status == 422
    end

    def forbidden?
      status == 403
    end

    def rate_limited?
      rate_limit.remaining <= 0
    end

    def rate_limit
      @rate_limit ||= OpenStruct.new(
        total:      http_response['x-ratelimit-limit'].to_i,
        remaining:  http_response['x-ratelimit-remaining'].to_i
      )
    end

    def scopes
      (http_response['x-oauth-scopes']||'').split(',').map(&:strip)
    end

    # resend the request
    def retry!
      @data, @link, @pages, @rate_limit = nil

      http_request = Github::API.send(:build_request_from_options, options||{})

      Github::API.send_request(http_request, options) do |response|
        self.http_response = response.http_response
        Rails.logger.info "--- RESPONSE RETRY ---"
      end
    end
  end
end
