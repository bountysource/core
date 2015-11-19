class Api::V1::FollowRelationsController < ApplicationController

  before_filter :require_auth
  before_filter :require_item

  after_filter log_activity(Tracker::Event::FOLLOW), only: [:follow]
  after_filter log_activity(Tracker::Event::UNFOLLOW), only: [:unfollow]

  def follow
    @follow_relation = FollowRelation.find_or_create_by(person: @person, item: @item)

    if @follow_relation.update_attributes(active: true)
      render "api/v1/follow_relations/show"
    else
      render json: { error: follow_relation.errors.full_messages.join(', ') }, status: :bad_request
    end
  end

  def unfollow
    @follow_relation = FollowRelation.find_or_create_by(person: @person, item: @item)

    if @follow_relation.update_attributes(active: false)
      render "api/v1/follow_relations/show"
    else
      render text: 'error', status: :bad_request
    end
  end

protected

  def require_item
    require_params :item_id, :item_type

    unless (@item = FollowRelation.find_item(params[:item_type], params[:item_id]))
      render json: { error: 'Item not found' }, status: :not_found
    end
  end
end
