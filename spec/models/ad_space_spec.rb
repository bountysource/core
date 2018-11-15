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

require 'spec_helper'

describe AdSpace do
  describe "validations" do
    it "has a valid factory" do
      expect(build(:ad_space)).to be_valid
    end

    it "does not create more than max count of a position" do
      as_one = create(:ad_space, position: 'header')
      as_two = build(:ad_space, position: 'header')

      expect(as_two).not_to be_valid
    end

    it "allows unlimited creation of position without max count" do
      as_one = create(:ad_space, position: 'interstitial')
      as_two = build(:ad_space, position: 'interstitial')

      expect(as_two).to be_valid
    end

    it "does not allow creation of random positions" do
      as_one = build(:ad_space, position: 'anything')

      expect(as_one).not_to be_valid
    end
  end
end
