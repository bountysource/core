json.(item, *%i(
id
amount
estimated_work
completed_by
bio
team_notes
state
created_at
updated_at
))

json.issue_id item.issue.id

if @include_person
  json.person do
    json.partial! 'api/v2/people/base', item: item.person
  end
else
  json.(item, :person_id)
end

if @include_request_for_proposal
  json.request_for_proposal do
    json.partial! 'api/v2/request_for_proposals/base', item: item.request_for_proposal
  end
else
  json.(item, :request_for_proposal_id)
end
