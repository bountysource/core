attribute :id
attribute :to_param => :slug
attribute :title
attribute :image_url
attribute :medium_image_url
attribute :large_image_url

attribute :frontend_path
attribute :short_description

attribute :total_pledged
attribute :funding_goal

attribute :published
attribute :published_at

attribute :featured

attribute :created_at
attribute :updated_at

attribute :days_open
attribute :days_remaining
attribute :in_progress? => :in_progress

node(:pledge_count) { |fr| fr.pledges_count }

# unless the fundraiser is published and has an ends_by date, return date right now + days_open
node(:ends_at) do |fundraiser|
  if fundraiser.published?
    fundraiser.ends_at
  else
    DateTime.now + (fundraiser.days_open || Fundraiser.min_days_open).days
  end
end

# does the authenticated person own this fundraiser? is the authenticated person an admin?
node(:owner) { |fr| fr.person == @person or @person.try :admin? }

node :frontend_edit_path, if: lambda { |fr| fr.person == @person or @person.try :admin? } do |fr|
  fr.frontend_edit_path
end

node :frontend_info_path, if: lambda { |fr| fr.person == @person or @person.try :admin? } do |fr|
  fr.frontend_info_path
end
