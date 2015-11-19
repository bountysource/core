class Api::V0::FollowRelationsController < Api::V0::BaseController

  def index
    @follow_relations = FollowRelation.order('updated_at desc')
    render "api/v1/follow_relations/index"
  end

end
