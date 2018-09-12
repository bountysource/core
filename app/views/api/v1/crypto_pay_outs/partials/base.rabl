attribute :id
child(:issue) { 
  attribute :id
  attribute :to_param => :slug


  child(:issue_address => :issueAddress) {
    attribute :id
    attribute :balance
  }
}

attribute :sent_at
attribute :state
attribute :receiver_address
attribute :funder_acct_address
attribute :amount
attribute :sent_at


child(:crypto_pay_out_txns) do
  attribute :state
  attribute :txn_hash
  attribute :type
end
