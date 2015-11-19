json.(item, *%i(
id
slug
title
subtitle
url
))

if @include_issues
  json.issues do
    json.array! item.issues, partial: 'api/v2/issues/base', as: :item, locals: { :include_tracker => true }
  end
else
  json.(item, :issue_ids)
end
