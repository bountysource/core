class Api::V2::PactApplicationsController < Api::BaseController
  before_action :require_auth, only: :create

  def index
    if params[:pact_id]
      @collection = PactApplication.where(pact_id: params[:pact_id])
    else
      @collection = PactApplication.all
    end
  end

  def create
    pact_application = PactApplication.create(
      person_id: current_user.id,
      pact_id: params[:pact_id],
      note: params[:note],
      status: 'STARTED'
    )

    response.status = :created

    @item = pact_application

    render 'api/v2/pact_applications/show'
  end

  def show
    @item = PactApplication.find(params[:id])
  end
end
