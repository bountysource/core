json.(cart, *%i(
uid
))

json.item_count @item_count

json.items do
  json.array! @items do |(item_json, item)|
    json.partial! 'api/v2/cart_items/base', item: item, locals: {
      item_amount: item_json['amount'],
      item_currency: item_json['currency']
    }
  end
end
