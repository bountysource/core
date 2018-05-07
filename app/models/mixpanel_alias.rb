# == Schema Information
#
# Table name: mixpanel_aliases
#
#  id          :integer          not null, primary key
#  distinct_id :string(255)      not null
#  person_id   :integer          not null
#  created_at  :datetime
#  updated_at  :datetime
#
# Indexes
#
#  index_mixpanel_aliases_on_distinct_id  (distinct_id) UNIQUE
#  index_mixpanel_aliases_on_person_id    (person_id)
#

class MixpanelAlias < ApplicationRecord

  class AlreadyClaimed < StandardError ; end

  def self.claim(person_id, distinct_id)
    quoted = {
      person_id: MixpanelAlias.connection.quote(person_id),
      distinct_id: MixpanelAlias.connection.quote(distinct_id.to_s),
      now: MixpanelAlias.connection.quote(Time.now)
    }

    # go to great lengths to insert this gracefully without throwing an exception
    inserted_id = MixpanelAlias.connection.insert("insert into mixpanel_aliases (person_id, distinct_id, created_at, updated_at)" +
      " select * from (values(#{quoted[:person_id]},#{quoted[:distinct_id]},#{quoted[:now]}::timestamp,#{quoted[:now]}::timestamp)) as t" +
      " where not exists (select 1 from mixpanel_aliases where distinct_id=#{quoted[:distinct_id]})")

    # if this was already claimed by somebody else, raise an exception
    raise AlreadyClaimed if MixpanelAlias.where(distinct_id: distinct_id.to_s).first.person_id != person_id

    # if that insert worked, then go take over some new ones
    MixpanelAlias.find(inserted_id).delay.update_events_with_person_id if inserted_id
  end

  def update_events_with_person_id
    MixpanelEvent.where(person_id: nil, distinct_id: self.distinct_id).update_all(person_id: self.person_id)
  end
end
