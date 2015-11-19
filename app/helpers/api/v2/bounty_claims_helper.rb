module Api::V2::BountyClaimsHelper

  include Api::V2::BaseHelper

  def filter!(collection)
    _collection = collection

    # Filter by Issue
    if params.has_key?(:issue_id)
      _collection = _collection.where(issue_id: params[:issue_id])
    end

    _collection = _filter_by_person_id(_collection)

    _collection
  end

  def order!(collection)
    return collection unless params.has_key?(:order)

    _collection = collection
    direction = _direction_for_order_value(params[:order])

    # Get raw column value, since it may be prepended with '+' or '-'
    order_value = _strip_order_value(params[:order])

    #case order_value
    #  when 'amount'
    #    _collection = _collection.reorder("developer_goals.amount #{direction}")
    #end

    _collection
  end

end
