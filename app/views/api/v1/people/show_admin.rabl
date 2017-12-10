object @person

extends "api/v1/people/partials/base"
extends "api/v1/people/partials/extended"
extends "api/v1/people/partials/account"

extends "api/v1/people/partials/github_account"    if can? :read, @person.github_account
extends "api/v1/people/partials/twitter_account"   if can? :read, @person.twitter_account
extends "api/v1/people/partials/facebook_account"  if can? :read, @person.facebook_account
