object false

child(@bounties) do
  node(:type) { |model| model.class.name }
  extends "api/v1/bounties/partials/base"
  extends "api/v1/bounties/partials/owner"
  extends "api/v1/bounties/partials/issue"
end

child(@pledges) do
  node(:type) { |model| model.class.name }
  extends "api/v1/pledges/partials/base"
  extends "api/v1/pledges/partials/owner"
  extends "api/v1/pledges/partials/fundraiser"
end

child(@member_relations => :members) do
  node(:type) { |model| model.person.class.name }
  extends "api/v1/teams/members"
  attribute :created_at
end