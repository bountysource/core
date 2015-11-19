object @team

extends "api/v1/teams/show"
extends "api/v1/people/partials/account"

child(:member_relations => :members) { extends "api/v1/teams/partials/member" }

node :linked_account_login do |team|
  team.linked_account ? team.linked_account.login : nil
end

attribute :homepage_featured
