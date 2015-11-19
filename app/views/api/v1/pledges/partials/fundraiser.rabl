child(:fundraiser) do
  extends "api/v1/fundraisers/partials/base"
  extends "api/v1/fundraisers/partials/extended" if can? :manage, root_object
end
