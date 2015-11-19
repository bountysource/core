attribute :id
attribute :to_param => :slug
attribute :name
attribute :frontend_path
attribute :frontend_url
attribute :full_name
attribute :image_url
attribute :url
attribute :type => :tracker_type
attribute :description
attribute :bounty_total
attribute :featured
attribute :watchers, if: lambda { |i| [Github::Repository].include?(i.class) }
attribute :forks, if: lambda { |i| [Github::Repository].include?(i.class) }
