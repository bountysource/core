object false

node(:in_progress)  { partial "api/v1/fundraisers/partials/card", object: @in_progress }
node(:completed)    { partial "api/v1/fundraisers/partials/card", object: @completed }
