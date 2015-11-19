node(:person) do |pledge|
  if can?(:read_anonymous, pledge)
    partial "people/partials/base", object: pledge.owner
  end
end