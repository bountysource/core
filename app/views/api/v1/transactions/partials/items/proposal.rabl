node(:type) { root_object.class.name }
extends "api/v1/proposals/partials/base"

child(:issue => :issue) do
  extends "api/v1/issues/partials/base"
  extends "api/v1/issues/partials/tracker"
end

child(:person => :person) do
  extends "api/v1/people/partials/base"
end