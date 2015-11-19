collection @owners_array

attribute :amount, :created_at

node(:owner) do |pledge|
  partial("owners/partials/base", object: pledge.owner)
end
