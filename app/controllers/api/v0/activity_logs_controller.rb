class Api::V0::ActivityLogsController < Api::V0::BaseController

  def index
    @activity_logs = ActivityLog.order('created_at desc')
  end

end
