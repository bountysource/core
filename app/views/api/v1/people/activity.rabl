object false

child(@bounties => :bounties) do
  node(:type) { |bounty| bounty.class.name }
  extends "api/v1/bounties/partials/base"

  node(:person) do |bounty|
    {
      slug: bounty.owner.to_param,
      display_name: bounty.owner.display_name
    }
  end

  child(:issue) do
    attribute :to_param => :slug
    attribute :title

    child(:tracker => :tracker) do
      attribute :to_param => :slug
      attribute :name
    end
  end
end

child(@crypto_bounties => :crypto_bounties) do
  node(:type) { |crypto_bounty| crypto_bounty.class.name }
  extends "api/v1/crypto_bounties/partials/base"

  node(:person) do |crypto_bounty|
    {
      slug: crypto_bounty.owner.to_param,
      display_name: crypto_bounty.owner.display_name
    }
  end

  child(:issue) do
    attribute :to_param => :slug
    attribute :title

    child(:tracker => :tracker) do
      attribute :to_param => :slug
      attribute :name
    end
  end
end

child(@pledges => :pledges) do
  node(:type) { |pledge| pledge.class.name }
  extends "api/v1/pledges/partials/base"

  node(:person) do |pledge|
    {
      slug: pledge.owner.to_param,
      display_name: pledge.owner.display_name
    }
  end

  child(:fundraiser) do
    attribute :to_param => :slug
    attribute :title
  end
end

child(@fundraisers => :fundraisers) do
  node(:type) { |fundraiser| fundraiser.class.name }
  extends "api/v1/fundraisers/partials/base"
end

child(@team_relations => :teams) do
  node(:type) { |relation| relation.team.class.name.split("::").first }
  extends "api/v1/people/partials/teams"
end

child(@bounty_claim_events_collected => :bounty_claim_events) do
  node(:type) { |bounty_claim_event| bounty_claim_event.class.name.split("::").last }
  extends "api/v1/bounty_claim_events/partials/base"
  extends "api/v1/bounty_claim_events/partials/bounty_claim"
end