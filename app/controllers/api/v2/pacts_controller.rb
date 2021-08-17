class Api::V2::PactsController < Api::BaseController
  before_action :require_auth, only: [:create, :show]

  def index
    @collection = Pact.all
  end

  def create
    pact = Pact.create(
      project_name: params[:project_name],
      pact_type: params[:pact_type],
      experience_level: params[:experience_level],
      time_commitment: params[:time_commitment],
      issue_type: params[:issue_type],
      expires_at: params[:expires_at],
      link: params[:link],
      issue_url: params[:issue_url],
      project_description: params[:project_description],
      person_id: current_user.id,
      # owner_type: params[:owner_type]
      # owner_id: params[:owner_id]
    )

    response.status = :created

    @item = pact

    render 'api/v2/pacts/show'
  end
  
  def show
    @current_user = current_user

    if params[:can_respond_to_claims].to_bool && current_user
      @include_pact_can_respond_to_claims = true
    end

    @item = Pact.find(params[:id])
  end

  def mark_completed
    @item = Pact.find(params[:id])
    @item.update_attributes!(completed_at: Time.now, can_add_bounty: false)

    render 'api/v2/pacts/show'
  end
end
