json.(item, *%i(
id
homepage
repo_url
featured
synced_at
open_issues
closed_issues
full_name
bounty_total
is_fork
))

json.type item.class.name

json.partial! 'api/v2/image_urls', item: item

json.display_name item.name
json.slug item.to_param

json.remote_url item.url
json.remote_name item.display_name

if @include_tracker_description
  json.description item.description
end

if @include_tracker_team
  json.team do
    json.partial! 'api/v2/owners/base', item: item.team if item.team
  end
end

if @include_tracker_issue_stats
  json.issue_stats item.issue_stats
end

if @team && @include_tracker_team_bounty_stats
  json.team_stats item.stats_for_team(@team)
end
