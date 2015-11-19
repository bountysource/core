child(:person) do
  attribute :id
  attribute :to_param => :slug
  attribute :display_name
  attribute :image_url
end