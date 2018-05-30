object false

node(:issues_total) { @issues_total }

child(@issues => :issues) do
  extends "api/v1/issues/partials/search"
  extends "api/v1/authors/partials/base" 

  child :tracker => :tracker do
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

    node :languages do |tracker|
      tracker.languages.map { |l| { name: l.name }}
    end
  end

  child :team => :team do
    attribute :image_url
    attribute :medium_image_url
    attribute :large_image_url
  end

end
