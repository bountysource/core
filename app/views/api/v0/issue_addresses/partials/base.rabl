attribute :id
attribute :public_address
attribute :created_at
attribute :balance


child(:issue) {
  attribute :id
  attribute :title
  attribute :to_param => :slug
}