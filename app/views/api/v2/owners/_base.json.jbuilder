if item
  json.type item.class.name
  json.id item.id
  json.slug item.to_param
  json.display_name item.display_name

  json.rfp_enabled item.rfp_enabled if item.is_a? Team

  json.partial! 'api/v2/image_urls', item: item

else
  json.display_name "Anonymous"
  json.image_url_small asset_path("anon.jpg")
  json.image_url_medium asset_path("anon.jpg")
  json.image_url_large asset_path("anon.jpg")
end
