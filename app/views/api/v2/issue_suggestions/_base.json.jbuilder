json.(item,
  :id,
  :description,
  :thanked_at,
  :rejected_at,
  :thanked_reward,
  :rejection_reason,
  :created_at,
  :updated_at
)

json.can_respond item.can_respond?(@current_user)

json.person do
  json.partial! 'api/v2/owners/base', item: item.person
end
json.team do
  json.partial! 'api/v2/owners/base', item: item.team
end
json.issue do
  json.partial! 'api/v2/issues/base', item: item.issue
end
