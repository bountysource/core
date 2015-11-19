collection @tracker_relations

attribute :created_at => :added_at

glue(:tracker => :tracker) { extends "api/v1/trackers/partials/base" }