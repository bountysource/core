module Api::V2::IssuesHelper

  include Api::V2::BaseHelper

  # Perform all of the filter methods
  def filter!(collection)
    # Limit by type
    collection = collection.where(type: params[:type]) if params.has_key?(:type)


    # Limit by Tracker ID
    if params.has_key? :tracker_id
      tracker_ids = (params[:tracker_id] || '').to_s.split(",")
      collection = collection.where(tracker_id: tracker_ids)

      # not a perfect place, but should be okay for now...
      Tracker.where(id: tracker_ids).each { |tracker| tracker.delay.remote_sync_if_necessary(state: "open", person: current_user) }
    end

    # Limit by Tracker Type
    if params.has_key?(:tracker_type)
      constant_names = tracker_constant_names_for_type(params[:tracker_type])
      collection = collection.joins(:tracker).where('trackers.type IN (?)', constant_names) unless constant_names.blank?
    end

    # Filter by Tracker owner type and id
    if params.has_key?(:tracker_team_id)
      collection = filter_by_tracker_team_id(collection, params[:tracker_team_id])
    end

    # Filter by issue open/closed
    collection = collection.where(can_add_bounty: params[:can_add_bounty].to_bool) if params.has_key?(:can_add_bounty)

    #Filter by issue paid_out
    collection = collection.where(paid_out: params[:paid_out].to_bool) if params.has_key?(:paid_out)

    # Filter by Featured
    collection = collection.where(featured: params[:featured].to_bool) if params.has_key?(:featured)

    # Filter by issue accepting request_for_proposals
    if params[:accepting_proposals].to_bool
      collection = filter_by_accepting_proposals(collection.joins(:request_for_proposal))
    end

    if params.has_key?(:bounty_min) || params.has_key?(:bounty_max)
      collection = filter_by_bounty_total(collection)
    end

    # Filter by Tracker owner type and id
    if params.has_key?(:thumbed_by_person_id)
      if params[:thumbed_by_person_id] == 'me' && current_user
        person_id = current_user.id
      else
        person_id = params[:thumbed_by_person_id]
      end
      collection = collection.joins(:thumbs).where("thumbs.person_id" => person_id, "thumbs.downvote" => false)
    end

    collection
  end

  # Perform all of the sort methods
  # TODO support more than once column at a time. for example: '+rank,+bounty,-remote_created'
  def order!(collection)
    return collection unless params.has_key?(:order)

    direction = _direction_for_order_value(params[:order])

    # Get raw column value, since it may be prepended with '+' or '-'
    order_value = _strip_order_value(params[:order])

    case order_value
    # when 'request_for_proposal'
    #   collection = collection.order_by_request_for_proposal(direction)
    # when 'team_rank'
    #   if params.has_key?(:team_id)
    #     collection = fetch_team_issue_ranks(params[:team_id])
    #     new_order = "issue_ranks.rank #{direction}"
    #   end
    # when 'linked_account_rank'
    #   if params.has_key?(:linked_account_id)
    #     collection = fetch_linked_account_issue_ranks(params[:linked_account_id])
    #     new_order = "issue_ranks.rank #{direction}"
    #   end
    # when 'rank'
    #   new_order = "issue_ranks.rank #{direction}"
    when 'bounty'
      new_order = "issues.bounty_total #{direction}"
    when 'created'
      new_order = "issues.remote_created_at #{direction}"
    when 'updated'
      new_order = "issues.remote_updated_at #{direction}"
    when 'comments'
      new_order = "coalesce(issues.comment_count, 0) #{direction}"
    when 'participants'
      new_order = "coalesce(issues.participants_count, 0) #{direction}"
    when 'thumbs'
      new_order = "coalesce(issues.thumbs_up_count, 0) #{direction}"
    when 'votes'
      new_order = "coalesce(issues.votes_count, 0) #{direction}"
    when 'thumbed_at'
      new_order = "thumbs.thumbed_at #{direction}"
    end

    # if primary ordering is thumbs, secondary is bounty. else, secondary is thumbs.
    if new_order == "coalesce(issues.thumbs_up_count, 0) desc"
      new_order = "#{new_order}, coalesce(issues.bounty_total, 0) desc"
    elsif new_order
      new_order = "#{new_order}, coalesce(issues.thumbs_up_count, 0) desc"
    end

    collection.reorder(new_order)
  end

  private

  # Filter issues on whether or not they are accepting proposals
  def filter_by_accepting_proposals(collection)
    collection.where("request_for_proposals.state = ?", 'pending')
  end

  # If owner_id is prefixed with '!' then the inverse query will be performed.
  def filter_by_tracker_team_id(collection, team_id)
    negate_owner_id = team_id[0] == '!'
    team_id = team_id.slice(1..-1) if negate_owner_id

    tracker_ids = Tracker.where(team_id: team_id).pluck(:id)
    collection.where("tracker_id #{'NOT' if negate_owner_id} in (?)", tracker_ids)
  end

  # filter issues by bounty_total, min, max, or range
  def filter_by_bounty_total(collection)
    if params.has_key?(:bounty_min) && params.has_key?(:bounty_max) && params[:bounty_max] > params[:bounty_min]
      collection = collection.where(bounty_total: params[:bounty_min]..params[:bounty_max])
    elsif params.has_key?(:bounty_min)
      collection = collection.where("issues.bounty_total >= ?", params[:bounty_min])
    elsif params.has_key?(:bounty_max)
      collection = collection.where("issues.bounty_total <= ?", params[:bounty_max])
    end
  end

  # If a team_id is present
  def fetch_team_issue_ranks(team_id, direction='desc')
    IssueRank::TeamRank.active.includes(:issue => [:tracker]).where(team_id: team_id)
  end

  def fetch_linked_account_issue_ranks(linked_account_id)
    IssueRank::LinkedAccountGithub.active.includes(:issue => [:tracker]).where(linked_account_id: linked_account_id)
  end

  def fetch_global_issue_ranks
    IssueRank.active.global.includes(:issue => [:tracker])
  end

  # Get Tracker constant name for the string version passed in as filter param.
  def tracker_constant_names_for_type(value)
    case value.downcase
    when 'github'       then %w(Github::Repository)
    when 'bitbucket'    then %w(Bitbucket::Tracker)
    when 'bugzilla'     then %w(Bugzilla::Tracker)
    when 'google'       then %w(GoogleCode::Tracker)
    when 'jira'         then %w(Jira::Tracker)
    when 'launchpad'    then %w(Launchpad::Tracker)
    when 'pivotal'      then %w(Pivotal::Tracker)
    when 'sourceforge'  then %w(SourceForge::Tracker SourceForgeNative::Tracker)
    when 'trac'         then %w(Trac::Tracker)
    end
  end

end
