collection @issues

attribute :id
attribute :type
attribute :to_param => :slug
attribute :frontend_path
attribute :title
attribute :url
attribute :featured
attribute :can_add_bounty
attribute :real_created_at => :created_at
attribute :generic
attribute :paid_out
attribute :priority
attribute :severity

attribute :comment_count
attribute :participants_count
attribute :thumbs_up_count
attribute :bounty_total

child :tracker => :tracker do
  attribute :to_param => :slug
  attribute :name
  attribute :image_url
end
