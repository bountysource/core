collection @teams

extends "api/v1/teams/partials/base"

#child(:member_relations => :members) { extends "api/v1/teams/partials/member" }

attribute :account_splits_total
attribute :member_relations_count
attribute :tag_relations_count
attribute :homepage_featured
