collection @transactions

extends "api/v0/transactions/partials/base"
extends "api/v0/transactions/partials/splits"

if @person.try(:admin?)
  extends "api/v0/transactions/partials/admin"
end
