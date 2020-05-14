class TrackController < ActionController::Base

  def track
    data = JSON.parse(Base64.decode64(params[:data]))

    MixpanelEvent.track(data)

    # mixpanel sends withCrednetials so mp_optout is respected but that's not allowed with a *
    headers['Access-Control-Allow-Origin'] = request.headers['Origin'] || '*'
    headers['Access-Control-Allow-Credentials'] = true

    headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE'
    headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With'
    headers['Access-Control-Max-Age'] = '86400'
    headers['Cache-Control'] = "no-cache, no-store, max-age=0, must-revalidate"
    headers['Pragma'] = "no-cache"
    headers['Expires'] = "Fri, 01 Jan 1990 00:00:00 GMT"
    head :ok
  end

  def decide
    # from first reply in https://community.mixpanel.com/sending-data-to-mixpanel-11/decide-endpoint-is-throwing-error-500s-on-page-load-1669
    # decide endpoint of a URL is responsible for providing checks to deliver in-apps and a/b test options to users
    # not using but called by javascript lib anyway, so set up empty response here with appropriate headers
    
    # mixpanel sends withCrednetials so mp_optout is respected but that's not allowed with a *
    headers['Access-Control-Allow-Origin'] = request.headers['Origin'] || '*'
    headers['Access-Control-Allow-Credentials'] = true

    headers['Access-Control-Allow-Methods'] = 'GET, POST, PATCH, PUT, DELETE'
    headers['Access-Control-Allow-Headers'] = 'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-Requested-With'
    headers['Access-Control-Max-Age'] = '86400'
    headers['Cache-Control'] = "no-cache, no-store, max-age=0, must-revalidate"
    headers['Pragma'] = "no-cache"
    headers['Expires'] = "Fri, 01 Jan 1990 00:00:00 GMT"
    head :ok
  end

end
