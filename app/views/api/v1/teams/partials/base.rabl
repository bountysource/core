attribute :id
attribute :name
attribute :slug
attribute :url
attribute :image_url
attribute :medium_image_url
attribute :large_image_url
attribute :accepts_public_payins
attribute :accepts_issue_suggestions
attribute :can_email_stargazers
attribute :featured
attribute :created_at
attribute :updated_at

attribute :rfp_enabled
attribute :activity_total

if root_object.bounties_disabled?
  node :bounties_disabled do
    true
  end
end
