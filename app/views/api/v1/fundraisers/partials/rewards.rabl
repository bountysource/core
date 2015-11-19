child :rewards do
  extends "api/v1/rewards/partials/base"

  child :pledges do
    extends "api/v1/pledges/partials/base"
    extends "api/v1/pledges/partials/owner"
  end
end

