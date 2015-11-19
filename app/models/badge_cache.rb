# == Schema Information
#
# Table name: badge_caches
#
#  id         :integer          not null, primary key
#  url        :string(255)      not null
#  raw_xml    :text             not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_badge_caches_on_url  (url) UNIQUE
#

class BadgeCache < ActiveRecord::Base
  attr_accessible :url, :raw_xml
end
