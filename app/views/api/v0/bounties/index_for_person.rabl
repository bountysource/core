collection @bounties

extends "api/v1/bounties/partials/base"
extends "api/v1/bounties/partials/issue"
extends "api/v1/bounties/partials/owner"
extends "api/v1/bounties/partials/options"
child(:source_account => :account) do
  extends "api/v1/accounts/partials/base"
  child({:owner => :owner}, if: lambda { |m| m.owner } ) { extends "api/v1/owners/partials/base" }
end
