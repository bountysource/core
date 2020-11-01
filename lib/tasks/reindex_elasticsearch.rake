# Run with heroku run:detached rake reindex:issues[0,10000000]
namespace :reindex do
  desc "Reindex issues with min and max"
  # Even with background jobs, batching takes too long. Set a max and min id to separate the batching
  task :issues, [:min_id, :max_id] => :environment do |t, args|
    Issue.searchkick_index.reindex(
        Issue.where('id > ? AND id < ?', args[:min_id], args[:max_id]),
        nil,
        scoped: false,
        async: true, resume: true, refresh_interval: "30s")
  end

  desc "Reindex trackers with min and max"
  # Even with background jobs, batching takes too long. Set a max and min id to separate the batching
  task :trackers, [:min_id, :max_id] => :environment do |t, args|
    Tracker.searchkick_index.reindex(
        Tracker.where('id > ? AND id < ?', args[:min_id], args[:max_id]),
        nil,
        scoped: false,
        async: true, resume: true, refresh_interval: "30s")
  end
end