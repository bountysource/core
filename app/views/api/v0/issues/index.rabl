collection @issues, pagination: false

extends "api/v0/issues/partials/base"
extends "api/v0/issues/partials/tracker"

node(:earliest_bounty_created_at) do |issue|
  issue.bounties.order("created_at DESC").first.created_at
end

node(:date_paid_out, :if => lambda { |issue| issue.paid_out }) do |issue|
  begin
    issue.collected_event.created_at
  rescue 
    nil
  end
end

node(:has_claim, :if => lambda { |issue| issue.bounty_claims.count > 0 }) do |issue|
  true
end
