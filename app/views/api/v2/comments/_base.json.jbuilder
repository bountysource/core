json.(item,
  :id,
  :created_at)

if @include_body_html
  json.body_html item.sanitized_body_html
end

if @include_author
  json.author do
    json.partial! 'api/v2/linked_accounts/base', item: item.author_or_dummy_author
  end
end
