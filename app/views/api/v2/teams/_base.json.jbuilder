json.(item, *%i(
  id
  name
  slug
))
json.activity_total item.activity_total.to_f

json.partial! 'api/v2/image_urls', item: item

# Only expose RFP flag if user is a Bountysource admin
json.rfp_enabled item.rfp_enabled? if @show_rfp_enabled_flag

json.bio item.bio if @include_team_extended || @include_team_bio

if @include_team_extended
  json.(item, *%i(
    featured
    url
    created_at
    updated_at
    issues_count
    updates_count
    trackers_count
    members_count
    backers_count
    tagged_count
    fundraisers_count
    open_bounties_amount
    open_issues_count
    closed_bounties_amount
    owned_issues_active_bounties_amount
    accepts_public_payins
    accepts_issue_suggestions
    can_email_stargazers
    homepage_markdown
    new_issue_suggestion_markdown
    bounty_search_markdown
    resources_markdown
    bounty_hunter_count
  ))
  json.community_can_edit item.has_no_members?
  json.bounties_disabled true if item.bounties_disabled?
  json.is_bounty_hunter item.is_bounty_hunter?(@current_user)
end

if @include_team_supporter_stats || @include_team_extended || @include_team_support_offering
  json.support_level_sum item.support_level_sum.to_f || 0.0
  json.support_level_count item.support_level_count || 0
  json.monthly_contributions_sum item.monthly_contributions_sum.to_f || 0.0
  json.monthly_contributions_count item.monthly_contributions_count || 0
  json.previous_month_contributions_sum item.previous_month_contributions_sum || 0.0

  unless @disclude_expensive_team_params_for_index
    json.updates_count item.updates_count || 0
    json.support_level_next_goal item.support_level_next_goal
  end
end

if @include_team_permissions
  json.is_member item.person_is_member?(@current_user)
  json.is_developer item.person_is_developer?(@current_user)
  json.is_admin item.person_is_admin?(@current_user)
  json.is_public item.person_is_public?(@current_user)
end

if @include_team_support_offering
  json.support_offering do
    json.partial! 'api/v2/support_offerings/base', item: item.support_offering || item.build_support_offering
  end
end

# used for related_to_team
if @team_tagged_ids || @team_backer_ids || @team_tagged_ids
  json.team_included @team_included_ids.include?(item.id)
  json.team_backed @team_backer_ids.include?(item.id)
  json.team_tagged @team_tagged_ids.include?(item.id)
end

if @include_team_top_reward
  json.hunter_awarded item.bounties.paid.count
  json.total_rewards item.bounties.sum(:amount)
end