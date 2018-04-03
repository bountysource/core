class Api::V2::TagsController < Api::BaseController

  include Api::V2::PaginationHelper

  before_action :require_auth, only: [ :create ]

  def index
    if params[:search]
      @collection = []
      unless params[:disclude_tags].to_bool
        @collection += Tag.where(Tag.arel_table[:name].matches("%#{params[:search].gsub(' ','%')}%")).joins(:child_tag_relations).where('weight>0').group('tags.id').order('sum(weight) desc').limit(15)
      end
      @collection += Team.where(Team.arel_table[:slug].matches("%#{params[:search].gsub(' ','%')}%")).order('length(slug)').limit(15)

      # TODO: sort order

      #@collection += Tag.joins(:relations).where('weight>0').group('tags.id').order('sum(weight) desc')
    elsif TagRelation::VALID_CLASSES.include?(params[:parent_type]) && params[:parent_id]
      parent = params[:parent_type].constantize.find(params[:parent_id])
      @collection = parent.parent_tag_relations.order('weight desc')
      @reference_child_relation = true
    elsif TagRelation::VALID_CLASSES.include?(params[:child_type]) && params[:child_id]
      child = params[:child_type].constantize.find(params[:child_id])
      @collection = child.child_tag_relations.order('weight desc')
      @reference_parent_relation = true
    elsif params[:featured]
      
      # query = TagRelation.where('weight>0').group('child_id, child_type').having('sum(weight) > 1')
      # query = query.joins(", teams").where("tag_relations.parent_id=teams.id and parent_type='Team' and teams.accepts_public_payins=true") if params[:accept_public_payins]
      # query = query.order('sum(weight) desc, max(tag_relations.updated_at) desc')
      # tagged_withs = query.pluck('child_id, child_type, sum(weight)').to_a
      tagged_withs = TagRelation.where('weight>0').pluck(:child_id, :child_type, :weight).uniq

      team_ids = tagged_withs.select { |child_id, child_type, weight| child_type=='Team' }.map(&:first)
      team_hash = Team.where(id: team_ids).inject({}) { |hash,team| hash[team.id] = team; hash }

      tag_ids = tagged_withs.select { |child_id, child_type, weight| child_type=='Tag' }.map(&:first)
      tag_hash = Tag.where(id: tag_ids).inject({}) { |hash,tag| hash[tag.id] = tag; hash }

      @collection = tagged_withs.map { |child_id,child_type,weight| child_type=='Tag' ? tag_hash[child_id] : team_hash[child_id] }
      # @collection = TagRelation.where('weight>0').group('child_id, child_type').select('child_id, child_type, sum(weight)')
      #
      #   Tag.joins(:child_tag_relations).where('weight>0').group('tags.id').having('sum(weight)>0').order('sum(weight) desc')
  
    else
      @collection = []
    end

    #@collection = paginate!(@collection)

    #TODO: joins(:tag_relations).group_by(tags.id).order(count(*))
    #@collection
  end

  def create
    if params[:parent_id] && params[:parent_type]=='Team'
      parent = Team.where(id: params[:parent_id]).first!
    # TODO: add Person here
    else
      raise "unexpected parent type: #{params[:parent_type]}"
    end

    if params[:child_id] && params[:child_type] == 'Tag'
      child = Tag.where(id: params[:child_id]).first!
    elsif params[:child_id] && params[:child_type] == 'Team'
      child = Team.where(id: params[:child_id]).first!
    elsif params[:child_text]
      #child = Team.where(slug: params[:child_text].downcase).first
      child = Tag.where(name: params[:child_text].downcase).first_or_create!
    end


    if params[:team_add_child]
      tag_relation = TagRelation.where(parent: parent, child: child, weight: 1).first_or_create!
    end

    if params[:team_remove_child]
      tag_relation = TagRelation.where(parent: parent, child: child).first.destroy
    end


    # tag_vote = tag_relation.votes.where(person: current_user).first_or_initialize
    # tag_vote.value = params[:downvote] ? -1 : 1
    # tag_vote.save!

    # render the index
    index
    render 'api/v2/tags/index'
  end

  def destroy
  end
end
