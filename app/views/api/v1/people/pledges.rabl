collection @pledges

extends "api/v1/pledges/partials/base"
extends "api/v1/pledges/partials/owner"
extends "api/v1/pledges/partials/reward"

child (:fundraiser) do
  extends "api/v1/fundraisers/partials/base"
  child(:rewards) { extends "api/v1/rewards/partials/base" }
  child(:person) { extends "api/v1/people/partials/base" }
end