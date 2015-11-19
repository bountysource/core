if can? :manage, root_object
  attribute :description
  attribute :frontend_edit_path
  attribute :hidden
end

attributes :about_me, :payout_method
           #:published_at, :created_at, :updated_at, :days_open

attributes :publishable? =>         :publishable,
           :description_to_html =>  :description_html

attributes :frontend_url

node :min_days_open do;   Fundraiser.min_days_open end
node :max_days_open do;   Fundraiser.max_days_open end
node :min_end_by_date do; Fundraiser.min_end_by_date end
node :max_end_by_date do; Fundraiser.max_end_by_date end

child(:person)  { extends "api/v1/people/partials/base" }

child(:trackers => :trackers) {extends "api/v1/trackers/partials/base"} if !@fundraiser.try(:in_progress?)

node(:rewards) do |parent|
  parent.rewards.non_zero.map { |s| partial("api/v1/rewards/partials/base", :object => s) }
end
