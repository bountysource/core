class Api::V1::EmailChangeVerificationsController < ApplicationController
  before_action :require_user

  def update
    if @person.email_confirmation?(params[:code]) && !@person.confirmation_token_expired?
      if @person.unconfirmed_email?
        @person.email = @person.unconfirmed_email
        @person.unconfirmed_email = nil
        @person.confirmed_at = DateTime.now

        if @person.save
          render json: { message: 'Email changed' }, status: :accepted
        else
          render json: { errors: @person.errors.full_messages }, status: :bad_request
        end
      else
        render json: { errors: "Current email is #{@person.email}." }, status: :bad_request
      end
    else
      render json: { errors: 'Verification code is not valid or has expired. Please request a new verification email.' }, status: :bad_request
    end
  end

private

  def require_user
    unless (@person = Person.find_by_email(params[:email]))
      render json: { message: 'Account not found' }, status: :not_found
    end
  end
end
