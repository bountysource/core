# == Schema Information
#
# Table name: badge_caches
#
#  id         :integer          not null, primary key
#  url        :string           not null
#  raw_xml    :text             not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_badge_caches_on_url  (url) UNIQUE
#

class BadgeCache < ApplicationRecord
end
