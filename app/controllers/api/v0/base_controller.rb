class Api::V0::BaseController < ApplicationController
  newrelic_ignore_apdex

  before_action :require_admin

protected

  def update_person_last_seen_at
    # override the method from ApplicationController so that the loaded @person is not falsely updated
  end

  def require_admin
    @admin_person = Person.find_by_access_token(params[:access_token])

    # Pull admin secret token off of access token.
    # It's simply appended to the end of the access token string.
    secret = nil
    if params.has_key?(:access_token)
      secret = params[:access_token].split('.').try(:[], 3)
    end

    unless @admin_person.try(:admin?) && secret == Api::Application.config.admin_secret
      render json: { error: 'Unauthorized access' }, status: :unauthorized
    end
  end
end
