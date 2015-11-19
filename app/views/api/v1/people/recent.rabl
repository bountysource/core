object false

node(:total_count) { @total_count }

child(@people) do
  extends "api/v1/people/partials/base"
end
