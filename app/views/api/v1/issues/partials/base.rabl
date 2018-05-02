attribute :id
attribute :type
attribute :to_param => :slug
attribute :frontend_path
attribute :sanitized_title => :title
attribute :short_body
attribute :url
attribute :featured
attribute :can_add_bounty
attribute :real_created_at => :created_at
attribute :generic
attribute :paid_out
attribute :priority
attribute :severity
attribute :number,                   if: lambda { |i| i.number }
attribute :comment_count
attribute :participants_count
attribute :thumbs_up_count
attribute :bounty_total
attribute :solution_started => :has_active_solution

child(:issue_address => :issue_address) do
  attribute :public_address
end
