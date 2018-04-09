# `item` will either be an Issue model, or an IssueRank model.
# When it is an IssueRank, render Issue columns with the rank attribute from IssueRank.

# Pull rank from IssueRank model, then set item to the Issue.
if item.is_a?(IssueRank)
  _rank = item.rank
  item = item.issue
end

json.(item,
  :id,
  :type,
  :featured,
  :priority,
  :can_add_bounty,
  :paid_out,
  :severity,
  :remote_created_at,
  :remote_updated_at,
  :state,
  :url)

json.bounty_total item.bounty_total.to_f
json.title item.sanitized_title
json.state item.state if item.respond_to?(:state)

# Add the rank if it was set from IssueRank model.
if defined?(_rank)
  json.rank _rank
end

json.created_at item.remote_created_at
json.slug       item.to_param

if @include_issue_body_html
  json.body_html item.sanitized_body_html
end

if @include_issue_body_markdown
  json.body_markdown item.body_markdown
end

if @include_issue_counts
  json.backers_count item.backers_count
  json.developers_count item.developers_count
end

json.has_active_solution       item.solution_started?

json.accepting_proposals item.accepting_proposals?

json.comments item.comment_count || 0
json.participants_count item.participants_count || 0
if @current_user
  tmp_has_thumbed_up = @current_user.thumbs.up_votes.where(item: item).count > 0
  json.has_thumbed_up tmp_has_thumbed_up
else
  tmp_has_thumbed_up = false
end
json.thumbs_up_count item.thumbs_up_count || 0
json.votes_count item.votes_count || 0

if @include_issue_tracker || defined?(locals) && locals[:include_tracker]
  json.tracker do
    json.partial! 'api/v2/trackers/base', item: item.tracker
  end
end

if @include_issue_team
  json.team do
    json.partial! 'api/v2/teams/base', item: item.team if item.team
  end
end

if @include_issue_author
  json.author do
    json.partial! 'api/v2/linked_accounts/base', item: @item.author_or_dummy_author
  end
end

if @include_issue_can_respond_to_claims
  json.can_respond_to_claims item.can_respond_to_claims?(@current_user)
end

if @include_workflow_state
  tmp_workflow_state = item.workflow_state
  json.workflow_state (tmp_has_thumbed_up && tmp_workflow_state == :issue_open_new) ? :issue_open_thumbed : tmp_workflow_state
end
