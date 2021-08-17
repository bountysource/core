collection @bounties

extends "api/v1/bounties/partials/base"
extends "api/v1/bounties/partials/owner"

child (:issue) do
  extends "api/v1/issues/partials/base"

  child(:tracker => :tracker) do
    extends "api/v1/trackers/partials/base"
  end
end

child (:pact) do
  extends "api/v1/pacts/partials/base"
end