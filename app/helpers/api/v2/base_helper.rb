module Api::V2::BaseHelper

  # Given a sort param, apply order to the collection based on prepended '+' or '-'
  # Examples:
  #   '+rank' returns 'desc'
  #   '-rank' returns 'asc'
  #   'rank' returns 'desc', the default value
  def _direction_for_order_value(order_value='')
    (order_value.try(:[], 0) || '').downcase == '-' ? 'asc' : 'desc'
  end

  # Strip order value of prepended + or -
  def _strip_order_value(order_value='')
    ((order_value =~ %r{\A[\+\-]} ? order_value.slice(1..-1) : order_value) || '').downcase.strip
  end

  def _filter_by_person_id(collection)
    if params.has_key?(:person_id)
      raise CanCan::AccessDenied.new("Session doesn't match person_id") if !current_user || current_user.id != params[:person_id].to_i
      collection = collection.where(person_id: current_user.id)
    end

    return collection
  end

end