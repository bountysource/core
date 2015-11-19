collection @trackers

extends "api/v1/trackers/partials/base"
extends "api/v1/trackers/partials/extended"

child :team => :team do
  extends "api/v1/teams/partials/base"
end