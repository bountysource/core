class Api::V0::TagsController < Api::V0::BaseController

  def index
    if params[:person_id]
      @collection = TagVote.where(person_id: params[:person_id])
      render 'api/v0/tag_votes/index'
    end
  end

  def show
    @item = Tag.where(id: params[:id]).first!
    render 'api/v0/tags/show'
  end

  def destroy
    @tag = Tag.where(id: params[:id]).first!

    bad_relation_ids = TagRelation.where(parent_id: @tag.id, parent_type: 'Tag').pluck(:id)
    bad_relation_ids += TagRelation.where(child_id: @tag.id, child_type: 'Tag').pluck(:id)
    TagRelation.where(id: bad_relation_ids).delete_all
    TagVote.where(tag_relation_id: bad_relation_ids).delete_all
    @tag.destroy
    render json: true
  end
end
