json.(item, *%i(
id
modify_title
modify_body
add_label
label_color
label_name
created_at
updated_at
))

json.type item.class.name

if @include_tracker
  json.tracker do
    json.partial! 'api/v2/trackers/base', item: item.tracker
  end
end

if @include_owner
  json.owner do
    json.partial! 'api/v2/owners/base', item: item.person
  end
end
