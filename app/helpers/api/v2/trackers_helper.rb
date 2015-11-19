module Api::V2::TrackersHelper

  include Api::V2::BaseHelper

  def filter!(collection)
    # Filter by Tracker type
    if params.has_key?(:type)
      collection = _filter_by_type(collection, params[:type].downcase)
    end

    # Filter by featured
    if params.has_key?(:featured)
      collection = collection.where(featured: params[:featured].to_bool)
    end

    # Filter by has active bounties
    if params.has_key?(:has_bounties)
      if params[:has_bounties].to_bool
        collection = collection.where("trackers.bounty_total > 0")
      else
        collection = collection.where("trackers.bounty_total <= 0 OR trackers.bounty_total IS NULL")
      end
    end

    # Filter by just Tracker owner type
    if params.has_key?(:owner_team_id)
      collection = _filter_by_owner_team_id(collection, params[:owner_team_id])
    end

    # Filter by team TrackerRelation
    if params.has_key?(:team_id)
      collection = _filter_by_team_id(collection, params[:team_id])

      # used but not owned
      if params.has_key?(:disclude_owned)
        collection = collection.where("team_id is null or team_id != ?", params[:team_id])
      end
    end

    collection
  end

  def order!(collection)
    return collection unless params.has_key?(:order)

    _collection = collection
    direction = _direction_for_order_value(params[:order])

    # Get raw column value, since it may be prepended with '+' or '-'
    order_value = _strip_order_value(params[:order])

    case order_value
    when 'bounty'
      _collection = _collection.order("trackers.bounty_total #{direction}")
    when 'open_issues'
      _collection = _collection.order("trackers.open_issues #{direction}")
    when 'closed_issues'
      _collection = _collection.order("trackers.open_issues #{direction}")
    end

    _collection
  end

  # Filter by Tracker owner type.
  # If owner_id is prefixed with '!' then the inverse query will be performed.
  def _filter_by_type(collection, owner_type)
    negate_owner_type = owner_type[0] == '!'
    tracker_owner_type = negate_owner_type ? owner_type.slice(1..-1) : owner_type
    type_constant_names = _tracker_constant_names_for_type(tracker_owner_type)
    collection.where("trackers.type #{ negate_owner_type ? 'NOT' : '' } IN (?)", type_constant_names)
  end

  def _filter_by_owner_team_id(collection, owner_id)
    negate_owner_id = owner_id[0] == '!'
    tracker_owner_id = negate_owner_id ? owner_id.slice(1..-1) : owner_id

    collection.where("trackers.team_id #{ negate_owner_id ? '!=' : '=' } ?#{ negate_owner_id ? ' OR trackers.team_id IS NULL' : '' }", tracker_owner_id.to_i)
  end

  def _filter_by_team_id(collection, team_id)
    collection.where("trackers.id in (select tracker_id from team_tracker_relations where team_id=?)", team_id.to_i)
  end

  # Get Tracker constant name for the string version passed in as filter param.
  def _tracker_constant_names_for_type(value)
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
