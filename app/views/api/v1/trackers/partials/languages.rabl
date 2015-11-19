child(:languages, if: lambda { |i| [Github::Repository].include?(i.class) }) do
  attributes :id, :name, :bytes, :search_weight
end
