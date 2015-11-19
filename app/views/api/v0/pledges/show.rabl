object @pledge

attribute :anonymous

extends "api/v1/pledges/partials/base"
extends "api/v1/pledges/partials/reward"
extends "api/v1/pledges/partials/fundraiser" # still include this for backwards compatibility
extends "api/v0/pledges/partials/person"
extends "api/v0/pledges/partials/splits"
