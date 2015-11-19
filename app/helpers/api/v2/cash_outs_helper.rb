module Api::V2::CashOutsHelper

  include Api::V2::BaseHelper

  def filter!(collection)
    # Filter by cash outs that have been sent
    if params.has_key? :sent
      if params[:sent].to_bool
        # Only show sent
        collection = collection.where('cash_outs.sent_at IS NOT NULL')
      else
        # Only show pending
        collection = collection.where('cash_outs.sent_at IS NULL')
      end
    end

    collection
  end

  def order!(collection)
    return collection unless params[:order]

    _collection = collection

    direction = _direction_for_order_value(params[:order])
    order_value = _strip_order_value(params[:order])

    case order_value
    when 'sent'
      _collection = _collection.reorder("sent_at #{direction}")

    when 'created'
      _collection = _collection.reorder("created_at #{direction}")
    end

    _collection
  end

end
