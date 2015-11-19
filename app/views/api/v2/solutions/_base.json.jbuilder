json.(item, *%i(
id
url
note
completion_date
status
created_at
updated_at
))

if @include_solution_issue
  json.issue do
    json.partial! 'api/v2/issues/base', item: item.issue
  end
end

if @include_solution_owner
  json.owner do
    json.partial! 'api/v2/owners/base', item: item.person
  end
end
