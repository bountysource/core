node(:tracker_plugin) do |tracker|
  if tracker.plugin && tracker.plugin.person == @person
    partial "api/v1/tracker_plugins/partials/base", object: tracker.plugin
  end
end
