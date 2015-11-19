json.(item, *%i(
id
))

if defined?(locals)
  json.amount locals[:item_amount] if locals[:item_amount]
  json.currency locals[:item_currency] if locals[:item_currency]
end

json.type item.class.name

json.owner do
  if item.try(:owner)
    json.partial! 'api/v2/owners/base', item: item.owner
  else
    json.null!
  end
end

# TODO - stop right there, criminal scum!!! use the partials we already have!
# might need to get clever with locals to include nested objects.
case item
when Pledge
  json.(item, *%i(reward_id survey_response))

  json.fundraiser do
    json.partial! 'api/v2/fundraisers/base', item: item.fundraiser, locals: { include_rewards: true }
  end

when Bounty
  json.(item, *%i(bounty_expiration upon_expiration promotion tweet))

  json.issue do
    json.partial! 'api/v2/issues/base', item: item.issue, locals: { include_tracker: true }
  end


when TeamPayin
  json.(item, *%i(team_id))

  json.team do
    json.partial! 'api/v2/teams/base', item: item.team
  end

when Proposal
  json.(item, *%i(amount completed_by bio))

  json.issue do
    json.partial! 'api/v2/issues/base', item: item.issue, locals: { include_tracker: true }
  end

  json.person do
    json.partial! 'api/v2/people/base', item: item.person
  end

when IssueSuggestionReward

  json.suggestion do
    json.partial! 'api/v2/issue_suggestions/base', item: item.issue_suggestion
  end

end
