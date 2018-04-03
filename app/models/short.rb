# == Schema Information
#
# Table name: shorts
#
#  id          :integer          not null, primary key
#  slug        :string           not null
#  destination :string           not null
#  created_at  :datetime         not null
#
# Indexes
#
#  index_shorts_on_slug  (slug) UNIQUE
#

class Short < ApplicationRecord
  validates :slug, presence: true, uniqueness: true
  validates :destination, presence: true, format: {with: /\A(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?\/.*\z/ix}
end
