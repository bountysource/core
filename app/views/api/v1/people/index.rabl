collection @people

extends "api/v1/people/partials/base"

child(:github_account => :github_account) do
  extends "api/v1/linked_accounts/partials/base"
end

child(:twitter_account => :twitter_account) do
  extends "api/v1/linked_accounts/partials/base"
end