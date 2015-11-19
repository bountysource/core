json.(item,
  :id,
  :created_at,
  :updated_at,
  :amount
)

if @include_developer_goal_owner
  json.owner do
    json.partial! 'api/v2/owners/base', item: item.person
  end
end