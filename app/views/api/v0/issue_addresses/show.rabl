object @issue_address

extends "api/v0/issue_addresses/partials/base"

child @crypto_bounties => :crypto_bounties do
  attribute :amount
  attribute :transaction_hash
end