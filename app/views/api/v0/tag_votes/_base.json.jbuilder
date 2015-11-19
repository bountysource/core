json.child do
  @reference_child_relation = true
  @reference_parent_relation = false
  json.partial! 'api/v2/tags/base', item: item.tag_relation
end

json.parent do
  @reference_child_relation = false
  @reference_parent_relation = true
  json.partial! 'api/v2/tags/base', item: item.tag_relation
end
