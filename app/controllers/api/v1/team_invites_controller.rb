class Api::V1::TeamInvitesController < ApplicationController
  before_action :require_auth
  before_action :require_team
  before_action :require_invite, except: [:index, :create]
  before_action :require_admin_member, only: [:index, :create]

  def index
    @invites = @team.invites
  end

  def create
    @invite = @team.invites.new(email: params[:email])
    @invite.admin = params[:admin].to_bool if params.has_key?(:admin)
    @invite.developer = params[:developer].to_bool if params.has_key?(:developer)
    @invite.public = params[:public].to_bool if params.has_key?(:public)

    unless @invite.save
      render json: { error: @invite.errors.full_messages.to_sentence }, status: :unprocessable_entity
    end

    @invite.delay.send_email if @invite.errors.empty?
  end

  def accept
    @invite.accept!(@person)
    render json: { status: "ok" }, status: :ok
  end

  def reject
    @invite.reject!
    render json: { status: "ok" }, status: :ok
  end

protected

  def require_team
    unless (@team = Team.find_by(slug: params[:id]))
      render json: { error: "Team not found" }, status: :not_found
    end
  end

  def require_invite
    require_team unless @team
    @invite = @team.invites.where(token: params[:token]).first
    unless @invite && TeamInvite.token_valid?(params[:token])
      render json: { error: "Not allowed" }, status: :forbidden
    end
  end

  def require_admin_member
    require_auth unless @person
    require_team unless @team
    relation = @team.relation_for_owner(@person)
    unless relation.try(:admin?)
      render json: { error: "Not allowed" }, status: :unauthorized
    end
  end
end
