module Api::V2::BackersHelper

  include Api::V2::PaginationHelper

  def top_backers(params={})
    select_query = [
      "COALESCE(owner_type, 'Person') as owner_type",
      "COALESCE(owner_id, person_id) as owner_id",
      "amount",
      "created_at"
    ]

    pledges = ::Pledge.
                not_refunded.
                where(anonymous: false).
                select(select_query.join(', '))

    bounties = ::Bounty.
                 not_refunded.
                 where(anonymous: false).
                 select((select_query - ['created_at'] + ['bounties.created_at as created_at']).join(', '))

    team_payins = ::TeamPayin.
                    not_refunded.
                    where("amount > ?", 0).
                    select(select_query.join(', '))

    # TODO: make this a param that's passed in. for now turn off for team
    timeframe_starts_at = 2.month.ago unless params.has_key?(:team_id) || params.has_key?(:team_slug)
    if timeframe_starts_at
      pledges = pledges.where("created_at > ?", timeframe_starts_at)
      bounties = bounties.where("bounties.created_at > ?", timeframe_starts_at)
      team_payins = team_payins.where("created_at > ?", timeframe_starts_at)
    end

    # Filter by Team
    if params.has_key?(:team_id)
      team = ::Team.where(id: params[:team_id])
    elsif params.has_key?(:team_slug)
      team = ::Team.where(slug: params[:team_slug])
    else
      team = nil
    end

    if team
      team = team.includes(:fundraisers, :trackers).first!
      pledges = pledges.where('pledges.fundraiser_id IN (?)', team.fundraisers.pluck(:id))
      bounties = bounties.joins("left join issues on bounties.issue_id=issues.id left join trackers on issues.tracker_id=trackers.id").where("trackers.team_id=?", team.id)
      #bounties = bounties.where('bounties.issue_id IN (?)', team.owned_trackers.joins(:issues).where('issues.bounty_total > 0 OR paid_out=?', true).pluck('issues.id'))
      team_payins = team_payins.where(team_id: team.id)
      team_sql = "WHERE (owner_type!='Team' OR owner_id!='#{team.id.to_i}')"
    else
      team_sql = ""
    end

    sql = "SELECT owner_type, owner_id, sum(amount) as amount, max(created_at) as last_activity_at FROM ( (#{pledges.to_sql}) UNION (#{bounties.to_sql}) UNION (#{team_payins.to_sql}) ) as T1 #{team_sql} GROUP BY owner_type, owner_id"

    # Run query once to get size of collection...
    collection = ApplicationRecord.connection.select_all sql

    # Apply order to SQL
    params[:order] ||= '+amount'
    order_direction = _direction_for_order_value(params[:order])
    order_value = _strip_order_value(params[:order])

    case order_value
    when 'amount'
      sql += " ORDER BY amount #{order_direction.downcase}"
    when 'activity'
      sql += " ORDER BY last_activity_at #{order_direction.downcase}"
    end

    # ...Then run it again with LIMIT and OFFSET so that render time doesn't break
    # Apply pagination to SQL
    pagination_values = calculate_pagination_values(collection, params)
    sql += " LIMIT #{pagination_values[:per_page]} OFFSET #{pagination_values[:offset]}"

    # Fetch that query
    rows = ApplicationRecord.connection.select_all(sql).to_a

    # In order to add the display_name of owners, collect IDs by owner_type,
    # Then perform queries per each owner_type
    owner_types_ids_map = {}
    rows.each do |row|
      owner_types_ids_map[row['owner_type']] ||= []
      owner_types_ids_map[row['owner_type']] << row['owner_id']
    end

    # return owner_types_ids_map

    # Turn array of IDs into models
    owner_types_ids_map.map do |(type, ids)|
      klass = type.constantize

      # Team display name column is called `name`
      if klass.name =~ %r{\ATeam}
        display_name_col = 'name'
      else
        display_name_col = 'display_name'
      end

      owner_types_ids_map[type] = klass.where(id: ids)
    end

    rows.map! do |row|
      model = owner_types_ids_map[row['owner_type']].find { |model| model.id == row['owner_id'].to_i }
      {
        type: row['owner_type'],
        id: row['owner_id'],
        amount: row['amount'],
        last_activity_at: ActiveSupport::TimeZone.new('UTC').parse(row['last_activity_at']),
        model: model
      }
    end

    # Apply ordering AFTER backer attrs added to rows
    if params[:order]
      order_direction = _direction_for_order_value(params[:order])
      order_value = _strip_order_value(params[:order])

      case order_value
      when 'display_name'
        if order_direction == 'desc'
          rows.sort! { |row1, row2| row1[:model].display_name <=> row2[:model].display_name }
        else
          rows.sort! { |row1, row2| row2[:model].display_name <=> row1[:model].display_name }
        end
      end
    end

    rows
  end

end
