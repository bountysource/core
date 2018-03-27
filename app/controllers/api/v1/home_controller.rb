class Api::V1::HomeController < ApplicationController

  before_action :authenticate_full_site_password, only: [:api_method_not_found]

  def api_docs
    render text: File.read( File.expand_path('bountysource.raml') ), content_type: 'text/yaml'
  end

  def api_method_not_found
    render :json => { error: 'Method not found' }, status: :not_found
  end

  def kill_window_js
    render text: %(<script type='text/javascript'>window.close();</script>)
  end
end
