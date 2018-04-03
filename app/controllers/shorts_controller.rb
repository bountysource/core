class ShortsController < ActionController::Base

  # TODO: make this work without lots of browser console errors
  # ensure_security_headers

  before_action :set_do_not_cache_headers

  def redirect
    slug = request.path[1..-1]
    if !slug.blank? && (short = Short.where(slug: slug).first)
      redirect_to short.destination
    else
      redirect_to Api::Application.config.www_url
    end
  end

protected

  def set_do_not_cache_headers
    headers['Cache-Control'] = "no-cache, no-store, max-age=0, must-revalidate"
    headers['Pragma'] = "no-cache"
    headers['Expires'] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end

end
