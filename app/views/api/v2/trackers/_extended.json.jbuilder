json.synced_at item.synced_at
json.watchers item.watchers if item.is_a?(Github::Repository)
json.forks item.forks if item.is_a?(Github::Repository)
json.description item.description