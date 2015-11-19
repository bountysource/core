node(:person) do |bounty|
  if can?(:read_anonymous, bounty)
    partial "people/partials/base", object: bounty.owner
  end
end
