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

    attrs = {
      first_name:     params[:first_name],
      last_name:      params[:last_name],
      organization:   params[:organization],
      address1:       params[:address1],
      address2:       params[:address2],
      city:           params[:city],
      state:          params[:state],
      postal_code:    params[:postal_code],
      country:        params[:country]
    }.reject { |_,v| v.blank? }

    @address = @person.create_address(attrs)
    # TODO: check logic, this is never reached
    # unless @address.valid?
    #   render json: { error: "Unable to create mailing address: #{@address.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
    # end

    render 'api/v1/addresses/show'
  end

  def update
    attrs = {
      first_name:     params[:first_name],
      last_name:      params[:last_name],
      organization:   params[:organization],
      address1:       params[:address1],
      address2:       params[:address2],
      city:           params[:city],
      state:          params[:state],
      postal_code:    params[:postal_code],
      country:        params[:country]
    }.reject { |_,v| v.blank? }
    @address.update_attributes(attrs)

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
end