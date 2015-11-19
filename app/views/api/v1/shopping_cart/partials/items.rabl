node(:items) do
  @person.shopping_cart.load_items.map do |item|
    partial "shopping_cart/partials/items/#{item.class.name.underscore.singularize}", object: item
  end
end
