json.(item, *%i(
id
budget
due_date
abstract
created_at
updated_at
state
))

if @include_issue
  json.issue do
    json.partial! 'api/v2/issues/'
  end
else
  json.(item, :issue_id)
end

if @include_team
  json.team do
    json.partial! 'api/v2/teams/base', item: item.issue.tracker.try(:owner)
  end
end
