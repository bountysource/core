json.partial! 'api/v2/request_for_proposals/base', item: item

json.person do
  json.partial! 'api/v2/people/base', item: item.person
end

json.team do
  json.partial! 'api/v2/teams/base', item: item.owner
end

json.issue do
  json.partial! 'api/v2/issues/base', item: item.issue
end

json.proposals do
  json.array! item.proposals, partial: 'api/v2/proposals/base', as: :item
end
