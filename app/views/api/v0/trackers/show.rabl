object @tracker

extends "api/v1/trackers/partials/base"
extends "api/v1/trackers/partials/extended"
extends "api/v1/trackers/partials/languages"

child :team => :team do
  extends "api/v1/teams/partials/base"
end