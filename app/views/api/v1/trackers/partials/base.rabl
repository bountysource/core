attribute :id
attribute :to_param => :slug
attribute :name
attribute :frontend_path
attribute :frontend_url
attribute :image_url
attribute :medium_image_url
attribute :large_image_url
attribute :full_name
attribute :url
attribute :type => :tracker_type
attribute :description
attribute :bounty_total
attribute :open_issues
attribute :closed_issues
attribute :is_fork
attribute :watchers
attribute :rank

node(:followed) do |tracker|
  @person and @person.followed_trackers.include? tracker
end
