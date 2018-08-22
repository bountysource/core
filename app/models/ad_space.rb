# == Schema Information
#
# Table name: ad_spaces
#
#  id            :bigint(8)        not null, primary key
#  cloudinary_id :string
#  title         :string
#  text          :text
#  button_text   :string
#  button_url    :string
#  position      :string
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class AdSpace < ApplicationRecord
  has_cloudinary_image
  
  validates :title, presence: true
  validates :text, presence: true
  validates :button_text, presence: true
  validates :cloudinary_id, presence: true
  validate :has_a_valid_position
  validate :position_max_count_not_reached
  
  # positions where the advert can be, and the maximum number of ads
  POSITIONS = [
    { name: "header", max_count: 1 },
    { name: "issue", max_count: 1 },
    { name: "interstitial" }
  ]

  def self.position_names
    POSITIONS.map { |x| x[:name] }
  end


  private
    def has_a_valid_position
      if position && AdSpace.position_names.exclude?(position)
        errors.add(:position, "#{position} is an invalid position")
      end
    end

    def position_max_count_not_reached
      return unless position
      return unless position_changed?
      # maximum number of this position
      position_type = POSITIONS.find{ |hash| hash[:name] == position}
      max_count = position_type ? position_type.dig(:max_count) : nil
      return unless max_count
      if AdSpace.where(position: position).count >= max_count
        errors.add(:position, "cannot have more than #{max_count} of #{position}")
      end
    end
end
