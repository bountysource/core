extends "api/v1/rewards/partials/base"

attribute :updated_at
attribute :delivered_at

child(:pledges) {
  child(:person) { extends "api/v1/people/partials/base" }
  extends "api/v1/pledges/partials/base"
}