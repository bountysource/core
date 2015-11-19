json.subtitle item.subtitle
json.body_markdown item.body_markdown
json.youtube_video_url item.youtube_video_url
json.goals item.sanitized_goals
json.extra item.sanitized_extra

json.rewards item.rewards.active do |reward|
  json.id reward.id
  json.amount reward.amount.to_f
  json.title reward.title
  json.description reward.description
  json.active_support_levels_count reward.active_support_levels_count
end
