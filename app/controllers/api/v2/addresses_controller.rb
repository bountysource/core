class Api::V2::AddressesController < Api::BaseController

  include Api::V2::AddressesHelper

  before_action :require_auth

  def index
    @collection = current_user.addresses.order('created_at asc')
  end

  def show
    @item = current_user.addresses.find params[:id]
  end

  def create
    # Split into two lines so that @item is initialized before ActiveRecord::RecordInvalid exception is raised
    @item = current_user.addresses.new address_params
    @item.save!
    render 'api/v2/addresses/show'
  end

  def update
    @item = current_user.addresses.find params[:id]
    @item.update_attributes! address_params
    render 'api/v2/addresses/show'
  end

  def destroy
    @item = current_user.addresses.find params[:id]
    @item.destroy!
    head :no_content
  end

  private

  # TODO use strong params ffs
  def address_params
    params.permit(:name, :address1, :address2, :address3, :city, :state, :postal_code, :country)
  end

end
