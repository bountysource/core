node(:type) { root_object.class.name }

attribute :amount

child(:issue_suggestion => :suggestion) do
  attribute :id
  attribute :description
  attribute :thanked_at
  attribute :rejected_at
  attribute :thanked_reward
  attribute :rejection_reason
  attribute :created_at
  attribute :updated_at

  child(:person => :person) do
    extends "api/v1/people/partials/base"
  end

  child(:team => :team) do
    extends "api/v1/teams/partials/base"
  end

  child(:issue => :issue) do
    extends "api/v1/issues/partials/base"
    extends "api/v1/issues/partials/tracker"
  end
end
