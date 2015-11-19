json.(item,
  :id,
  :value,
  :description,
  :created_at,
  :updated_at)

if @include_bounty_claim_response_owner
  json.owner do
    json.partial! 'api/v2/owners/base', item: item.person
  end
end
