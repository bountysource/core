json.(item,
  :id,
  :title,
  :short_description,
  :funding_goal,
  :total_pledged,
  :created_at,
  :published,
  :published_at,
  :featured,
  :days_open,
  :days_remaining)

json.partial! 'api/v2/image_urls', item: item

json.slug item.to_param
json.in_progress item.in_progress?

# Set ends at date
if item.published?
  json.ends_at item.ends_at
else
  json.ends_at DateTime.now + (item.days_open || ::Fundraiser.min_days_open).days
end

if @include_description
  json.description item.description
end

if @include_description_html
  json.description_html item.description_to_html
end

if @include_owner
  json.owner do
    json.partial! 'api/v2/owners/base', item: item.person
  end
end

if @include_rewards || defined?(locals) && locals[:include_rewards]
  json.rewards do
    json.array! item.rewards, partial: 'api/v2/fundraiser_rewards/base', as: :item
  end
end
