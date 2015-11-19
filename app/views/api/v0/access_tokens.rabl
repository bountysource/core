collection @tokens

attribute :created_at
attribute :remote_ip
attribute :user_agent

child(:person) do
  extends "api/v1/people/partials/base"
end
