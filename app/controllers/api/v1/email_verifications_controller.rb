class Api::V1::EmailVerificationsController < ApplicationController
  before_action :require_user
  before_action :check_for_unconfirm_user

  def create
    if @person.confirmation_sent_at.nil? || @person.confirmation_sent_at < 5.minutes.ago
      @person.create_confirmation_token
      @person.send_email(:email_verification, token: @person.temp_confirmation_token)
      render json: { message: 'Verification email sent. Please verify your account within 2 hours.' }
    else
      render json: { message: 'Please wait for 5 minutes before you request a new verification email' }
    end
  end

  def update
    if @person.email_confirmation?(params[:code]) && !@person.confirmation_token_expired?
      @person.confirmed_at = DateTime.now

      if @person.save
        render json: { message: 'Verify' }, status: :accepted
      else
        render json: { error: "Unable to verify your account: #{person.errors.full_messages.join(', ')}" }, status: :bad_request
      end
    else
      render json: { error: "Verification code is not valid or has expired. Please request a new verification email." }, status: :bad_request
    end
  end

private

  def require_user
    unless (@person = Person.find_by_email(params[:email]))
      render json: { message: 'Account not found' }, status: :not_found
    end
  end

  def check_for_unconfirm_user
    if @person.confirmed_at != nil
      render json: { message: 'Your email already verify. Please login.' }, status: :continue
    end
  end
end
