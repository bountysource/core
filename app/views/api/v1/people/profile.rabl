object @profile_person

extends "api/v1/people/partials/base"

if can? :manage, @profile_person
  extends "api/v1/people/partials/extended"
  extends "api/v1/people/partials/account"
end

extends "api/v1/people/partials/github_account"    if can? :read, @profile_person.github_account
extends "api/v1/people/partials/twitter_account"   if can? :read, @profile_person.twitter_account
extends "api/v1/people/partials/facebook_account"  if can? :read, @profile_person.facebook_account
extends "api/v1/people/partials/gittip_account"    if can? :read, @profile_person.gittip_account
