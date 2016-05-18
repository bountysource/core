if item
  json.(item, *%i(
  id
  name
  address1
  address2
  address3
  city
  state
  postal_code
  country
  ))
else
  json.id 0
end
