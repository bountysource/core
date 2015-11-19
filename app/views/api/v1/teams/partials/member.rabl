object @member_relation

attribute :admin? => :is_admin
attribute :developer? => :is_developer
attribute :public? => :is_public
attribute :member? => :is_member
attribute :created_at => :added_at
attribute :has_budget? => :has_budget
attribute :budget
attribute :balance

case root_object.owner
when Person
  glue(:owner) { extends "api/v1/people/partials/base" }
when LinkedAccount::Base
  glue(:owner) { extends "api/v1/linked_accounts/partials/base" }
end
