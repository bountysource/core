json.(item,
  :id,
  :pact_type,
  :experience_level,
  :time_commitment,
  :issue_type,
  :expires_at,
  :paid_at,
  :link,
  :issue_url,
  :project_name,
  :project_description,
  :person_id,
  :owner_type,
  :owner_id,
  :featured,
  :created_at,
  :updated_at,
  :can_add_bounty,
  :completed_at
)

json.bounty_total item.bounty_total.to_f
