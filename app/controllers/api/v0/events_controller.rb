class Api::V0::EventsController < Api::V0::BaseController

  def index
    @collection = MixpanelEvent.includes(:person).order('created_at desc').limit(250).where.not(event: 'mp_page_view')
    @collection = @collection.where(person_id: params[:person_id]) if params[:person_id]
    render 'api/v0/events/index'
  end

end
