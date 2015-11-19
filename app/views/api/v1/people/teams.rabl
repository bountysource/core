collection @team_relations

attribute :public? => :is_public
attribute :developer? => :is_developer
attribute :admin? => :is_admin
attribute :member? => :is_member
attribute :balance => :member_balance
attribute :budget => :member_budget

glue(:team) do
  extends "api/v1/teams/partials/base"
  extends "api/v1/teams/partials/account"
end
