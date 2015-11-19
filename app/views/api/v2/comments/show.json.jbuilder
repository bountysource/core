json.partial! 'base', item: @item

if @include_issue
  json.issue do
    json.partial! 'api/v2/issues/base', item: @item.issue
  end
end
