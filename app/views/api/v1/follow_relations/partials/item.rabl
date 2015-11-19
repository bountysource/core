node(:item) do |follow_relation|
  case follow_relation.item
  when Tracker then partial "trackers/partials/base", object: follow_relation.item
  end
end
