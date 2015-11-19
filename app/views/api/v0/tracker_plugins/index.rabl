collection @tracker_plugins

attribute :synced_at
attribute :locked_at
attribute :last_error

extends "api/v1/tracker_plugins/partials/base"
extends "api/v1/tracker_plugins/partials/person"
extends "api/v0/tracker_plugins/partials/tracker"
