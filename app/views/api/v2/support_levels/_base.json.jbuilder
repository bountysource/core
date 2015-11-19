json.id item.id
json.amount item.amount.to_f
json.status item.status
json.created_at item.created_at
json.canceled_at item.canceled_at if item.canceled_at

json.owner do
  json.partial! 'api/v2/owners/base', item: item.owner
end

unless @disclude_team
  json.team do
    json.partial! 'api/v2/owners/base', item: item.team
  end
end

if item.reward
  json.reward do
    json.id item.reward.id
    json.title item.reward.title
    json.description item.reward.description
    json.amount item.reward.amount.to_f
  end
end

if !@disclude_payment_method && item.payment_method
  json.payment_method do
    json.partial! 'api/v2/payment_methods/base', item: item.payment_method
  end
end
