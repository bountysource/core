json.partial! 'base', item: @item

json.support_level_payments do
  json.array! @item.payments, partial: 'api/v2/support_level_payments/base', as: :item
end