# == Schema Information
#
# Table name: tracker_plugins
#
#  id                    :integer          not null, primary key
#  tracker_id            :integer          not null
#  modify_title          :boolean          default(FALSE), not null
#  add_label             :boolean          default(FALSE), not null
#  modify_body           :boolean          default(FALSE), not null
#  synced_at             :datetime
#  created_at            :datetime         not null
#  updated_at            :datetime         not null
#  label_name            :string           default("bounty"), not null
#  type                  :string
#  person_id             :integer
#  bounties_accepted_msg :string
#  bounty_available_msg  :string
#  bounty_claimed_msg    :string
#  label_color           :string           default("#129e5e"), not null
#  locked                :boolean          default(FALSE), not null
#  last_error            :text
#  locked_at             :datetime
#
# Indexes
#
#  index_tracker_plugins_on_add_label   (add_label)
#  index_tracker_plugins_on_person_id   (person_id)
#  index_tracker_plugins_on_synced_at   (synced_at)
#  index_tracker_plugins_on_tracker_id  (tracker_id) UNIQUE
#

require 'spec_helper'

describe TrackerPlugin do
end
