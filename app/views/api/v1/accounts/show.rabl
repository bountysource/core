object @account
extends "api/v1/accounts/partials/base"

child (:transactions) do
  extends "api/v1/transactions/partials/base"
end

