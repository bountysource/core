attribute :id
attribute :amount
attribute :created_at
attribute :status

if can?(:manage, root_object)
  attribute :anonymous
end
