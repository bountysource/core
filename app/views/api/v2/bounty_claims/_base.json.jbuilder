json.(item,
  :id,
  :number,
  :code_url,
  :description,
  :amount,
  :collected,
  :disputed,
  :rejected,
  :created_at,
  :updated_at,
  :pact_id,
  :dispute_period_ends_at)

json.in_dispute_period item.in_dispute_period?
json.contested !(item.issue&.paid_out? || item.pact&.paid_at?) && item.contested?

if @include_bounty_claim_owner
  json.owner do
    json.partial! 'api/v2/owners/base', item: item.person
  end
end

if @include_bounty_claim_issue
  json.issue do
    json.partial! 'api/v2/issues/base', item: item.issue
  end
end

if @include_bounty_claim_pact
  json.pact do
    json.partial! 'api/v2/pacts/base', item: item.pact
  end
end

if @include_bounty_claim_responses
  json.responses item.bounty_claim_responses, partial: 'api/v2/bounty_claim_responses/base', as: :item
  json.accept_count item.accept_count
  json.reject_count item.reject_count
  json.backers_count item.backers_count
end
