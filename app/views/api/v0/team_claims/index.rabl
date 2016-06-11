collection @team_claims

attribute :id
attribute :claim_notes

child :person do
  extends "api/v1/people/partials/base"
  extends "api/v1/people/partials/extended"
  extends "api/v1/people/partials/github_account"
end

child :team do
  extends "api/v1/teams/partials/base"
  extends "api/v1/teams/partials/linked_account"
end
