if item[:tracker]
  json.tracker do
    json.type item[:tracker].class.name
    json.partial! 'api/v2/trackers/base', item: item[:tracker]
  end
elsif item[:team]
  json.team do
    json.type 'Team'
    json.partial! 'api/v2/teams/base', item: item[:team]
  end
end

json.paid item[:paid].to_f
json.active item[:active].to_f
