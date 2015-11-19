module Api::V2::FundraisersHelper

  include Api::V2::BaseHelper

  def filter!(collection)
    _collection = collection

    # Filter by Team
    if params.has_key? :team_id
      # _collection = _collection.where('owner_type LIKE ? AND owner_id = ?', 'Team%', params[:team_id])
      _collection = _collection.where(team_id: params[:team_id])
    end

    # Filter by featured
    if params.has_key? :featured
      _collection = _collection.where(featured: params[:featured].to_bool)
    end

    # Filter by in progress
    if params.has_key? :in_progress
      if params[:in_progress].to_bool
        _collection = _collection.merge(::Fundraiser.in_progress)
      else
        _collection = _collection.merge(::Fundraiser.ended)
      end
    end

    _collection
  end

  def order!(collection)
    return collection unless params[:order]

    _collection = collection

    direction = _direction_for_order_value(params[:order])
    order_value = _strip_order_value(params[:order])

    case order_value
    when 'published'
      _collection = _collection.reorder("fundraisers.published #{direction}")

    when 'pledge_total'
      _collection = _collection.reorder("COALESCE(fundraisers.total_pledged, 0) #{direction}")
    end

    _collection
  end

end
