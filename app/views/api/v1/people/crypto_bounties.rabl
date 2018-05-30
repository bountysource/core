collection @crypto_bounties

extends "api/v1/crypto_bounties/partials/base"
extends "api/v1/crypto_bounties/partials/owner"

child (:issue) do
  extends "api/v1/issues/partials/base"

  child(:tracker => :tracker) do
    extends "api/v1/trackers/partials/base"
  end
end
