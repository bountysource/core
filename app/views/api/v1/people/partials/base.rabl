node(:type) { |person| person.class.name }

attribute :id
attribute :to_param => :slug
attribute :display_name
attribute :frontend_path
attribute :frontend_url
attribute :image_url
attribute :medium_image_url
attribute :large_image_url
attribute :created_at
attribute :bio
attribute :location
attribute :company
attribute :url
attribute :public_email
attribute :profile_completed

if can?(:manage, root_object)
  attribute :admin
end

if @reset_mixpanel_id
  node :reset_mixpanel_id do
    true
  end
end
