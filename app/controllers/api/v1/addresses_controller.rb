class Api::V1::AddressesController < ApplicationController

  before_action :require_auth
  before_action :require_mailing_address, except: [:create]

  def show
  end

  def create
    if @person.address
      return render json: { error: "Mailing address has already been created" }, status: :bad_request
    end

    require_params(:first_name, :last_name, :address1, :city, :state, :postal_code, :country)

    @address = @person.create_address(person_params)
    # TODO: check logic, this is never reached
    # unless @address.valid?
    #   render json: { error: "Unable to create mailing address: #{@address.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    # end

    render 'api/v1/addresses/show'
  end

  def update
    @address.update_attributes(person_params)

    render 'api/v1/addresses/show'

    # TODO: check logic, this is never reached
    # unless @address.update_attributes(attrs)
    #   render json: { error: "Unable to update mailing address" }, status: :unprocessable_entity
    # end
  end

protected

  def require_mailing_address
    unless (@address = @person.address)
      render json: { error: "Mailing address not found" }, status: :not_found
    end
  end

  def person_params
    params.permit(:first_name, :last_name, :address1, :city, :state, :postal_code, :country, :organization, :address2)
  end
end