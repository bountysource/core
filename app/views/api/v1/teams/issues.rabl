object false

glue(:issues_count) { @issues_count }

child(@issue_ranks => :issues) do
  attribute :rank

  glue(:issue => :issue) do
    attribute :id
    attribute :type
    attribute :to_param => :slug
    attribute :frontend_path
    attribute :title
    attribute :url
    attribute :can_add_bounty
    attribute :remote_created_at => :created_at
    attribute :generic
    attribute :paid_out
    attribute :priority
    attribute :severity

    attribute :comment_count
    attribute :participants_count
    attribute :thumbs_up_count
    attribute :bounty_total

    child :tracker => :tracker do
      attribute :name
      attribute :to_param => :slug
      attribute :image_url
    end
  end
end
