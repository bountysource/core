extends "api/v1/issues/index"

child(:accepted_bounty_claim => :accepted_bounty_claim) { extends "api/v1/bounty_claims/partials/base" }