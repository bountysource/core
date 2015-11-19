object false

child(@top_backers => :top_backers) do
  node(:total_backed) do |owner|
      @top_backers_map.fetch(owner, 0)
  end
  extends "api/v1/people/partials/base"
end
