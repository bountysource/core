node :gittip_account do |person|
  partial "api/v1/linked_accounts/partials/base", object: person.gittip_account
end
