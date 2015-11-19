json.(item, *%i(
currency
))

json.balance @balance

if @current_user.try(:admin?)
  json.(item,
  :id,
  :type,
  :created_at,
  :updated_at)
end

if @include_owner && can?(:manage, item)
  json.owner do
    json.partial! 'api/v2/owners/base', item: item.owner
  end
end

if defined?(@cash_out_amount)
  json.cash_out do
    json.fee            @cash_out_fee
    json.amount         @cash_out_amount
  end
end
