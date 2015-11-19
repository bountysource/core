child :team => :team do
  extends "api/v1/teams/partials/base"
  extends "api/v1/teams/partials/extended"

  child :public_member_relations => :members do
    extends "api/v1/teams/partials/member"
  end
end
