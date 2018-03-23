object false

node(:people) { partial "api/v1/people/index", object: @people }
node(:bounties) { partial "api/v0/bounties/index", object: @bounties }
node(:fundraisers) { partial "api/v1/fundraisers/index", object: @fundraisers }
node(:trackers) { partial "api/v1/trackers/index", object: @trackers }
node(:transactions) { partial "api/v0/transactions/index", object: @transactions }
