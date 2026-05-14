json.array! @collection do |item|
  json.partial! 'base', item: item
end
