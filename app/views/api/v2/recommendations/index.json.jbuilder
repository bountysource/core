json.array! @collection do |item|

  json.type item[:type]
  json.created_at item[:created_at]

  json.issue do
    json.id item[:issue].id
    json.slug item[:issue].to_param
    json.title item[:issue].sanitized_title + (item[:issue].bounty_total > 0 ? " (#{number_to_currency(item[:issue].bounty_total, precision: 0)})" : "")
    json.bounty_total item[:issue].bounty_total.to_f
  end

  json.tracker do
    json.slug item[:tracker].to_param
    json.display_name item[:tracker].name
    json.image_url_small item[:tracker].image_url
  end

end

