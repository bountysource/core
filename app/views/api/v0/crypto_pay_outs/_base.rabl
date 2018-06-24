attribute :id
child(:issue) { 
  attribute :id
  attribute :to_param => :slug


  child(:issue_address => :issueAddress) {
    attribute :id
    attribute :balance
  }
}
child(:person){ 
  attribute :display_name
  attribute :email
  attribute :to_param => :slug
  node(:type) { |p| p.class.name }  
}

attribute :sent_at
attribute :state
attribute :receiver_address
attribute :funder_acct_address
attribute :amount
attribute :sent_at