child(:bounty_claim => :bounty_claim) do
  child(:issue) do
    attribute :id
    attribute :to_param => :slug
    attribute :frontend_path
    attribute :title

  end
end