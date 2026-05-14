json.(item,
  :id,
  :reporter_id,
  :target_type,
  :target_id,
  :reason,
  :description,
  :status,
  :created_at,
  :updated_at)

json.reporter do
  json.partial! 'api/v2/linked_accounts/base', item: item.reporter.display_name
end if item.reporter
