extends "api/v1/transactions/partials/items/base"
extends "api/v1/pledges/partials/base"
extends "api/v1/pledges/partials/reward"

child(:fundraiser) do
  extends "api/v1/fundraisers/partials/base"
end
