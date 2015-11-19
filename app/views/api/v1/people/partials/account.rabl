node(:account) { |person|
  if person.account
    partial "api/v1/accounts/partials/base", object: person.account
  else
    {
      id: nil,
      type: person.account_class.name,
      balance: 0
    }
  end
}
