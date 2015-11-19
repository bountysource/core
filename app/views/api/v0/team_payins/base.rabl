extends "api/v1/team_payins/partials/base"
extends "api/v1/team_payins/partials/team"
extends "api/v1/team_payins/partials/person"
child(:owner => :owner) { extends "api/v1/owners/partials/base" }
