node(:type) { |owner| owner.class.name }

attribute :id
attribute :display_name
attribute :to_param => :slug
attribute :image_url
attribute :medium_image_url
attribute :large_image_url
attribute :created_at