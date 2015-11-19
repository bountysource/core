node(:items) do |transaction|
  transaction.items.map do |item|
    partial "api/v1/transactions/partials/items/#{item.class.name.underscore.singularize}", object: item
  end
end