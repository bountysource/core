node(:type) { root_object.class.name }
extends "proposals/partials/base"

child(:issue => :issue) do
  extends "issues/partials/base"
  extends "issues/partials/tracker"
end

child(:person => :person) do
  extends "people/partials/base"
end
