child(:bounties) do
  extends "api/v1/bounties/partials/base"
  extends "api/v1/bounties/partials/issue"
  extends "api/v1/bounties/partials/owner"

  child(:person) do
    extends "api/v1/people/partials/base"
  end
end
