json.(item, *%i(
id
created_at
status
))

json.amount item.amount.to_f

if @include_bounty_owner
  json.owner do
    if item.owner
      json.partial! 'api/v2/owners/base', item: item.owner
    else
      json.null!
    end
  end
end

if @include_bounty_issue
  json.issue do
    json.partial! 'api/v2/issues/base', item: item.issue
  end
end
