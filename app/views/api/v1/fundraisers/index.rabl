collection @fundraisers

extends "api/v1/fundraisers/partials/base"
child :person do
  extends "api/v1/people/partials/base"
end
# child :team => :team do
#   extends "api/v1/teams/partials/base"
# end
