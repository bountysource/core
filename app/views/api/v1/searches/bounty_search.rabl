object false

node(:issues_total) { @issues_total }
child(@issues => :issues) do
  is_pact = lambda { |item| item.is_a?(Pact) }
  is_issue = lambda { |item| item.is_a?(Issue) }

  node(:type) { |item|
    case item
      when Pact
        "pact"
      when Issue
        "issue"
    end
  }

  extends "api/v1/issues/partials/search", :if => is_issue
  extends "api/v1/authors/partials/base", :if => is_issue

  extends "api/v1/pacts/partials/search", :if => is_pact
  node :author, :if => is_pact do |obj|
    if obj.person
      partial("api/v1/people/partials/base", :object => obj.person)
    end
  end

  child :tracker, :if => is_issue do
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

    node :languages, :if => is_issue do |tracker|
      tracker.try(:languages).try(:map) { |l| { name: l.name }}
    end
  end

  child :team => :team do
    attribute :image_url
    attribute :medium_image_url
    attribute :large_image_url
  end

end
