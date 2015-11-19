json.partial! 'base', item: @item

# this view should only be used by /people/me which is for yourself
json.email @item.email
