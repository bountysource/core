# == Schema Information
#
# Table name: events
#
#  id         :integer          not null, primary key
#  slug       :string           not null
#  title      :string
#  url        :string
#  issue_ids  :integer          default([]), not null, is an Array
#  created_at :datetime
#  updated_at :datetime
#  subtitle   :string
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
