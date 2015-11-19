module Api::V2::PeopleHelper

  def filter!(collection)

    if params[:bounty_hunters_for_team]
      collection = collection.bounty_hunters(team: Team.where(slug: params[:bounty_hunters_for_team]).first!)
      @include_bounty_claim_total = true
    end

    if params[:bounty_hunters] == 'alltime'
      collection = collection.bounty_hunters
      @include_bounty_claim_total = true
    elsif params[:bounty_hunters] == '90days'
      collection = collection.bounty_hunters(since: 90.days.ago)
      @include_bounty_claim_total = true
    end

    collection
  end

  def order!(collection)
    return collection unless params.has_key? :order

    direction = _direction_for_order_value(params[:order])

    # Get raw column value, since it may be prepended with '+' or '-'
    order_value = _strip_order_value(params[:order])

    case order_value
    when 'created_at'
      collection = collection.reorder("people.created_at #{direction}")

    when 'followers'
      collection = collection.joins(:linked_accounts).where('linked_accounts.person_id is not null and linked_accounts.followers > ?', 100).group('people.id').select('people.*, sum(linked_accounts.followers) as followers')
      collection = collection.reorder("sum(linked_accounts.followers) #{direction}")
    end

    collection
  end
end
