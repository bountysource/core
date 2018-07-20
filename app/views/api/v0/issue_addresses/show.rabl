object @issue_address

extends "api/v0/issue_addresses/partials/base"

child @crypto_bounties => :crypto_bounties do
  attribute :amount
  attribute :transaction_hash
end

child @crypto_pay_outs => :crypto_pay_outs do
  attribute :state
  attribute :receiver_address
  attribute :funder_acct_address
  attribute :fee
  attribute :fee_percent
  attribute :fees_acct_address
  attribute :sent_at
  attribute :created_at
  attribute :balance
  attribute :bounty
  attribute :is_refund
  attribute :transaction_hash
  attribute :reason
end