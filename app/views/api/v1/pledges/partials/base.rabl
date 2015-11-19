attribute :id
attribute :amount
attribute :created_at

# survey response if you are the owner of the pledge, or the creator of the fundraiser
if can?(:manage, root_object)
  attribute :survey_response
  attribute :anonymous
end
