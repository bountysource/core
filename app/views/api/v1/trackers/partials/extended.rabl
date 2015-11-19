attribute :url
attribute :homepage
attribute :repo_url
attribute :featured
attribute :bounty_total
attribute :frontend_url
attribute :synced_at
attribute :watchers, if: lambda { |i| [Github::Repository].include?(i.class) }
attribute :forks, if: lambda { |i| [Github::Repository].include?(i.class) }

extends "api/v1/trackers/partials/plugin"
