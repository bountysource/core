# NOTE: run "heroku run bundle exec flying-sphinx configure" after modifying this file
ThinkingSphinx::Index.define(:issue_rank, :name => "team_issue", :with => :active_record) do
  #fields to search with text
  indexes issue.title
  indexes issue.body

  #order/filter by these fields
  has rank
  has team_id
  has last_event_created_at

  has issue.bounty_total
  has issue.can_add_bounty
  has issue.tracker.team_id, as: :tracker_team_ids
  has issue.participants_count
  has issue.thumbs_up_count
  has issue.remote_created_at

  where("issue_ranks.type = 'IssueRank::TeamRank'")
  # Limit index to only those issues that are open? For now, simply using a filter
  # where("issues.id IN (SELECT DISTINCT team_issue_relations.issue_id FROM team_issue_relations) AND issues.can_add_bounty = true")

  ## Fields we may use later ##
  # has issue.tracker.languages(:id), :as => :language_ids
  # has issue.tracker(:id), :as => :tracker_ids

  set_property :field_weights => {
    :title => 50,
    :body => 1
  }
end
