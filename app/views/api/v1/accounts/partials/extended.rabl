object @account

child (:transactions) do
  extends "api/v1/transactions/partials/base"
  extends "api/v0/transactions/partials/splits"
end
