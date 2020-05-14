# == Schema Information
#
# Table name: mixpanel_events
#
#  id          :integer          not null, primary key
#  person_id   :integer
#  distinct_id :string(255)
#  event       :string(255)
#  created_at  :datetime
#  payload     :json
#
# Indexes
#
#  index_mixpanel_events_on_created_at   (created_at)
#  index_mixpanel_events_on_distinct_id  (distinct_id)
#  index_mixpanel_events_on_person_id    (person_id)
#

class MixpanelEvent < ApplicationRecord
  belongs_to :person

  # flexible method that does the dirty work
  def self.track(properties)
    # symbols or strings
    properties = properties.with_indifferent_access

    # squash hash down to a single level
    properties.merge!(properties.delete(:properties)).with_indifferent_access if properties.has_key?(:properties)

    # extra fields
    event = properties.delete(:event) or raise "Missing event name"
    distinct_id = properties.delete(:distinct_id)
    person_id = properties.delete(:person_id)
    token = properties.delete(:token) # not used...

    # if distinct_id is missing, use person_id
    if distinct_id.nil? && !person_id.nil?
      distinct_id = person_id.to_s
      MixpanelAlias.claim(person_id, distinct_id)
    elsif !distinct_id.nil? && person_id.nil?
      distinct_id = distinct_id.to_s
      person_id = MixpanelAlias.find_by(distinct_id: distinct_id).person_id # not guaranteed
    else
      raise "Missing distinct_id and person_id"
    end

    MixpanelEvent.create!(
      distinct_id: distinct_id,
      event: event,
      person_id: person_id,
      payload: {
        event: event,
        properties: properties
      }
    )
  end
end
