object @person

extends "api/v1/people/partials/base"
extends "api/v1/people/partials/extended"
extends "api/v1/people/partials/account"

extends "api/v1/people/partials/github_account"    if can? :read, @person.github_account
extends "api/v1/people/partials/twitter_account"   if can? :read, @person.twitter_account
extends "api/v1/people/partials/facebook_account"  if can? :read, @person.facebook_account
extends "api/v1/people/partials/gittip_account"    if can? :read, @person.gittip_account

extends "api/v1/people/partials/fundraisers"

child(:bounties) do
  extends "api/v1/bounties/partials/base"
  extends "api/v1/bounties/partials/issue"
  extends "api/v1/bounties/partials/owner"
  extends "api/v1/bounties/partials/options"
  child(:source_account => :account) do
    extends "api/v1/accounts/partials/base"
    child({:owner => :owner}, if: lambda { |m| m.owner } ) { extends "api/v1/owners/partials/base" }
  end
end
