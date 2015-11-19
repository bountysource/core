json.(item, *%i(
  id
  created_at
  distinct_id
  event
  payload
))

json.person do
  json.partial! 'api/v2/people/base', item: item.person if item.person
end
