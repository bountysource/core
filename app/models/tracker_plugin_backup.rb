# == Schema Information
#
# Table name: tracker_plugin_backups
#
#  id                :integer          not null, primary key
#  tracker_plugin_id :integer          not null
#  issue_id          :integer          not null
#  raw               :text             not null
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_tracker_plugin_backups_on_issue_id           (issue_id)
#  index_tracker_plugin_backups_on_tracker_plugin_id  (tracker_plugin_id)
#

class TrackerPluginBackup < ApplicationRecord
  belongs_to :plugin, class_name: "TrackerPlugin", foreign_key: :tracker_plugin_id
  belongs_to :issue
  has_one :tracker, through: :issue

  validates :issue, presence: true
  validates :raw, presence: true

  def load
    YAML.load(raw)
  end
end
