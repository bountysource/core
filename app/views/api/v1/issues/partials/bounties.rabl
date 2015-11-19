child(:visible_bounties => :bounties) do
  extends "api/v1/bounties/partials/base"
  extends "api/v1/bounties/partials/issue"
  extends "api/v1/bounties/partials/owner"
end
