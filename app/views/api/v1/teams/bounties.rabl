collection @bounties

extends "api/v1/bounties/partials/base"
child(:issue) do
  attribute :to_param => :slug
  attribute :title
  attribute :paid_out
  node(:paid_at, :if => lambda { |issue| issue.paid_out }) { |issue| issue.collected_bounty_claim.try(:created_at) }
  attribute :bounty_total
  attribute :can_add_bounty

  child :tracker => :tracker do
    attribute :to_param => :slug
    attribute :name
    attribute :image_url

    child :team => :team do
      attribute :to_param => :slug
      attribute :name
      attribute :image_url
    end
  end

  child :active_solutions => :solutions do
    extends "api/v1/solutions/partials/base"
  end

  child :developer_goals do
    extends "api/v1/developer_goals/partials/base"
  end

  child :bounty_claims do
    extends "api/v1/developer_goals/partials/base"
  end
end
