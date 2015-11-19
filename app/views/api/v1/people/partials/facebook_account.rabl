node :facebook_account do |person|
  partial "api/v1/linked_accounts/partials/base", object: person.facebook_account
end
