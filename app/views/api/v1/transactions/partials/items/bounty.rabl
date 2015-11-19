extends "api/v1/transactions/partials/items/base"
extends "api/v1/bounties/partials/base"
extends "api/v1/bounties/partials/options"

child(:issue => :issue) do
  extends "api/v1/issues/partials/base"
  extends "api/v1/issues/partials/tracker"
end
