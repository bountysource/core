# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

def create_users
  50.times do
    Person.create(
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      display_name: Faker::Name.title,
      email: Faker::Internet.email,
      password: "test1234",
      password_confirmation: "test1234"
    )
  end
end

def create_tracker_and_team
  Search.create(query: "https://github.com/bountysource/core").results
end

def sync_tracker_issues
  # fetch issue from the tracker created above
  Tracker.first.remote_sync_if_necessary
end

def create_closed_issue
  Search.create(query: "https://github.com/bountysource/core/issues/1200").results
  Search.create(query: "https://github.com/bountysource/core/issues/1202").results
end

def featured_team
  # make bountysource featured in homepage and team page
  bountysource = Team.first
  bountysource.featured = true
  bountysource.homepage_featured = true
  bountysource.save
end

def create_random_bounty
  2.times do
    issue = Issue.order("RANDOM()").first
    Person.order("RANDOM()").first.bounties.create(amount: rand(1..10)*10, issue_id: issue.id)
    issue.update_bounty_total
  end
end

def create_random_solution_and_bounty_claim
  issue = Issue.where(state: "closed").first
  Person.order("RANDOM()").first.bounties.create(amount: 100, issue_id: issue.id)
  bounty_claim = Person.order("RANDOM()").first.bounty_claims.new(description: "Solved", collected: true, amount: 100)
  bounty_claim.issue_id = issue.id
  bounty_claim.paid_out = true
  bounty_claim.save
  issue.paid_out = true
  issue.save
  issue.update_bounty_total
  bounty_claim_event=BountyClaimEvent::Collected.new
  bounty_claim_event.bounty_claim_id = bounty_claim.id
  bounty_claim_event.save
end

create_users
create_tracker_and_team
sync_tracker_issues
create_closed_issue
featured_team
create_random_bounty
create_random_solution_and_bounty_claim
create_random_bounty