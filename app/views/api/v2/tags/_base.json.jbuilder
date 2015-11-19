if item.is_a?(TagRelation) && @reference_child_relation
  tag_object = item.child
elsif item.is_a?(TagRelation) && @reference_parent_relation
  tag_object = item.parent
elsif item.is_a?(Team) || item.is_a?(Tag)
  tag_object = item
end

json.id tag_object.id
json.type tag_object.class.name
json.name tag_object.name
json.image_url tag_object.image_url if tag_object.is_a?(Team)
json.slug tag_object.slug if tag_object.is_a?(Team)
json.votes item.weight if item.is_a?(TagRelation)
