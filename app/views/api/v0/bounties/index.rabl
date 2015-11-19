collection @bounties

extends "api/v0/bounties/partials/base"
extends "api/v1/bounties/partials/options"
extends "api/v0/bounties/partials/person"

child(:issue => :issue) do
  extends "api/v1/issues/partials/base"
end