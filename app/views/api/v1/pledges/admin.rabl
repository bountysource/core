object @pledge

extends "api/v1/pledges/partials/base"
extends "api/v1/pledges/partials/splits"

child(:fundraiser) do
  extends "api/v1/fundraisers/partials/base"
  extends "api/v1/fundraisers/partials/extended"
end

# override the person partial, which excludes the person
# when the pledge is anon
child(:person) do
  extends "api/v1/people/partials/base"
end