# == Schema Information
#
# Table name: recommendation_events
#
#  id         :integer          not null, primary key
#  person_id  :integer
#  event      :string(255)
#  issue_id   :integer
#  created_at :datetime
#
# Indexes
#
#  index_recommendation_events_on_person_id_and_issue_id_and_event  (person_id,issue_id,event)
#

class RecommendationEvent < ActiveRecord::Base
  attr_accessible :event, :issue_id
end
