json.id item.person_id || item.id
json.slug item.person.try(:to_param) || item.to_param
json.display_name item.name

json.type item.person_id ? Person.name : item.class.name

json.partial! 'api/v2/image_urls', item: item