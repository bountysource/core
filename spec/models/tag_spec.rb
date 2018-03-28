# == Schema Information
#
# Table name: tags
#
#  id         :integer          not null, primary key
#  name       :string(255)      not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  image_url  :string(255)
#
# Indexes
#
#  index_tags_on_name  (name) UNIQUE
#

require 'spec_helper'

describe Tag do

  it "should create a tag" do
    expect {
      create(:tag)
    }.to change(Tag, :count).by 1
  end

  it "should enforce name uniqueness" do
    # create the tag
    create(:tag, name: 'derp')

    # build a tag with the same name
    tag = build(:tag, name: 'derp')

    expect(tag).not_to be_valid
    expect(tag.errors).to have_key :name
  end

end
