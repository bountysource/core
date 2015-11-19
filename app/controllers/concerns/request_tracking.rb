module RequestTracking
  extend ActiveSupport::Concern

  included do
    prepend_before_filter :add_tracking
  end

  private

  def add_tracking
    begin
      ::NewRelic::Agent.add_custom_parameters(:person_id           => current_user.try(:id))
      ::NewRelic::Agent.add_custom_parameters(:person_email        => current_user.try(:email))
      ::NewRelic::Agent.add_custom_parameters(:person_display_name => current_user.try(:display_name))
      ::NewRelic::Agent.add_custom_parameters(:person_first_name   => current_user.try(:first_name))
      ::NewRelic::Agent.add_custom_parameters(:person_last_name    => current_user.try(:last_name))
      ::NewRelic::Agent.add_custom_parameters(:api_version_header  => request.headers['Accept'])
      ::NewRelic::Agent.add_custom_parameters(:user_agent          => request.user_agent)
    rescue => e
      # Log the error to NR, and move on with your life. We don't want this method to interrupt the request
      ::NewRelic::Agent.notice_error(e)
    end
  end
end
