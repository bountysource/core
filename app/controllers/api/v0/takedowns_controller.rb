class Api::V0::TakedownsController < Api::V0::BaseController
  def index
    @takedowns = Takedown.order('created_at desc').includes(:linked_account)
    render "api/v0/takedowns/index"
  end

  def create
    target = LinkedAccount::Github::User.find_by_login(params[:search])
    target ||= LinkedAccount::Github::Organization.find_by_login(params[:search])

    if target
      Takedown.create!(linked_account: target)
      render json: { success: true }
    else
      render json: { error: "GitHub account not found" }, status: :unprocessable_entity
    end
  end
end
