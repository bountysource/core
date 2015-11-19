json.(item, *%i(
id
display_name
bio
location
company
url
public_email
profile_completed
created_at
))

json.type item.class.name
json.slug item.to_param
json.admin item.admin if can?(:manage, item)

json.email item.email if @include_person_email

# If we ordered by followers, then the sum of followers will be available
json.followers item.followers if item.respond_to? :followers

json.partial! 'api/v2/image_urls', item: item


json.bounty_claim_total item.bounty_claim_total if @include_bounty_claim_total
