module Api::V2::PledgesHelper

  include Api::V2::BaseHelper

  def filter!(collection)
    _collection = collection

    # Filter by Fundraiser
    if params.has_key?(:fundraiser_id)
      _collection = _collection.where(fundraiser_id: params[:fundraiser_id])
    end

    _collection
  end

  def order!(collection)
    return collection unless params.has_key?(:order)

    _collection = collection
    direction = _direction_for_order_value(params[:order])

    # Get raw column value, since it may be prepended with '+' or '-'
    order_value = _strip_order_value(params[:order])

    case order_value
    when 'amount'
      _collection = _collection.reorder("pledges.amount #{direction}")
    end

    _collection
  end

end
