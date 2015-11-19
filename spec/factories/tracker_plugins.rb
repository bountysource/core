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
#  label_name            :string(255)      default("bounty"), not null
#  type                  :string(255)
#  person_id             :integer
#  bounties_accepted_msg :string(255)
#  bounty_available_msg  :string(255)
#  bounty_claimed_msg    :string(255)
#  label_color           :string(255)      default("#129e5e"), not null
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

# Read about factories at https://github.com/thoughtbot/factory_girl

FactoryGirl.define do
  factory :tracker_plugin do
    association :person, factory: :person
    association :tracker, factory: :tracker

    locked false

    modify_title false
    modify_body false
    add_label false

    factory :github_plugin, class: TrackerPlugin::GH
  end
end
