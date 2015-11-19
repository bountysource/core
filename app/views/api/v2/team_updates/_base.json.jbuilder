json.(item,
  :id,
  :number,
  :title,
  :published_at)

json.mailing_lists item.mailing_lists
json.slug item.to_param if item.published?

if @include_body
  json.body item.body
end

if @include_truncated_body
  json.body_truncated item.body_truncated
end

if @include_team
  json.team do
    json.partial! 'api/v2/teams/base', item: item.team if item.team
  end
end

# if @include_body_html
#   json.body_html item.body_html
# end
