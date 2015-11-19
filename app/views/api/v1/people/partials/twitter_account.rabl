node :twitter_account do |person|
  partial "api/v1/linked_accounts/partials/base", object: person.twitter_account
end
