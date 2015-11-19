collection @issues

attribute :id
attribute :type
attribute :to_param => :slug
attribute :title
attribute :featured
attribute :can_add_bounty
attribute :real_created_at => :created_at
attribute :generic
attribute :paid_out
attribute :priority
attribute :severity
attribute :number, if: lambda { |i| i.number }
attribute :comment_count
attribute :participants_count
attribute :thumbs_up_count
attribute :bounty_total
attribute :solution_started => :has_active_solution
