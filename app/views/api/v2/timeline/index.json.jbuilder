json.array! @collection do |item|

  json.event item[:event]
  json.timestamp item[:timestamp]

  if item[:actor].is_a?(LinkedAccount::Base) && item[:actor].person
    actor = item[:actor].person
  else
    actor = item[:actor]
  end

  if actor.is_a?(Team) || actor.is_a?(Person)
    json.actor do
      json.type actor.class.name
      json.slug actor.to_param
      json.display_name actor.display_name
      json.image_url_small actor.image_url
    end
  elsif actor.is_a?(LinkedAccount::Base)
    json.actor do
      json.type actor.class.name
      json.display_name actor.login
      json.image_url_small actor.image_url
    end
  elsif !actor && %w(support_level_created).include?(item[:event])
    json.actor do
      json.type 'Anonymous'
      json.display_name 'Anonymous'
      json.image_url_small asset_path("anon.jpg")
    end
  end

  if item[:issue] && !@disclude_issue
    json.issue do
      json.slug item[:issue].to_param
      json.title item[:issue].sanitized_title
      json.bounty_total [item[:issue].bounty_total, (item[:bounty_claim] ? item[:bounty_claim].amount : 0.0)].max.to_f
    end
  end

  if item[:body_html]
    json.body_html item[:body_html]
  end

  if item[:bounty]
    json.bounty do
      json.amount item[:bounty].amount.to_f
      json.featured true if @include_featured_bounties && item[:bounty].featured?
    end
  end

  if item[:tracker] && !@disclude_tracker
    json.tracker do
      json.slug item[:tracker].to_param
      json.display_name item[:tracker].name
      json.image_url_small item[:tracker].image_url
    end
  end

  if item[:pledge]
    json.pledge do
      json.amount item[:pledge].amount.to_f
    end
  end

  if item[:team_payin]
    json.team_payin do
      json.amount item[:team_payin].amount.to_f
    end
  end

  if item[:fundraiser]
    json.fundraiser do
      json.title item[:fundraiser].title
      json.total_pledged item[:fundraiser].total_pledged.to_f
      json.funding_goal item[:fundraiser].funding_goal
    end
  end

  if item[:support_level]
    json.support_level do
      json.amount item[:support_level].amount.to_f
    end
  end

  if item[:team] && !@disclude_team
    json.team do
      json.slug item[:team].slug
      json.display_name item[:team].display_name
      json.image_url_small item[:team].image_url
    end
  end

end
