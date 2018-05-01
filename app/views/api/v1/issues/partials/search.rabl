attribute :id
attribute :to_param => :slug
attribute :frontend_path
attribute :title
attribute :url
attribute :featured
attribute :can_add_bounty
attribute :real_created_at => :created_at
attribute :real_updated_at => :updated_at
attribute :generic
attribute :paid_out
attribute :body_markdown => :description

attribute :comment_count
attribute :participants_count
attribute :thumbs_up_count
attribute :bounty_total
