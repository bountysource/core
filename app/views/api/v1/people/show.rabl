object @person

extends "api/v1/people/partials/base"

if can? :manage, @person
  extends "api/v1/people/partials/extended"
  extends "api/v1/people/partials/account"
end

extends "api/v1/people/partials/github_account"    if can? :read, @person.github_account
extends "api/v1/people/partials/twitter_account"   if can? :read, @person.twitter_account
extends "api/v1/people/partials/facebook_account"  if can? :read, @person.facebook_account
extends "api/v1/people/partials/wallets"  if can? :read, @person.wallets