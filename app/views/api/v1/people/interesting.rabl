object false

child(:developers) do
  child(@celebrities => :top) do
    node(:followers) do |person|
      person.total_followers.to_i
    end
    extends "api/v1/people/partials/base"
  end
end

child(:backers) do
  child(@top_backers => :top) do
    node(:total_backed) do |owner|
      @top_backers_map.fetch(owner, 0)
    end

    node(:type) { |owner| owner.class.name }
    extends "api/v1/people/partials/base"
  end
end

child(:earners) do
  child(@top_earners => :top) do
    node(:total_earned) do |person|
      @top_earners_map.fetch(person, 0)
    end

    extends "api/v1/people/partials/base"
  end
end

child(@new => :new) { extends "api/v1/people/partials/base" }