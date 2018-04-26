# == Schema Information
#
# Table name: events
#
#  id         :integer          not null, primary key
#  slug       :string(255)      not null
#  title      :string(255)
#  url        :string(255)
#  issue_ids  :integer          default([]), not null, is an Array
#  created_at :datetime
#  updated_at :datetime
#  subtitle   :string(255)
#
# Indexes
#
#  index_events_on_slug  (slug) UNIQUE
#

class Event < ApplicationRecord
  validates :slug, presence: true, uniqueness: true

  def issues
    Issue.where(id: issue_ids)
  end

end
