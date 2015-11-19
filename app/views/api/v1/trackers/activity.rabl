object false

child(:claims) do
  child(@claims_submitted => :submitted) do
    extends "api/v1/bounty_claims/partials/base"
  end

  child(@claims_collected => :collected) do
    node(:amount) do |claim|
      claim.issue.bounty_total
    end

    extends "api/v1/bounty_claims/partials/base"
  end

  child(@claims_disputed => :disputed) do
    extends "api/v1/bounty_claims/partials/base"
  end
end

child(@bounties_placed => :bounties) do
  extends "api/v1/bounties/partials/base"
end