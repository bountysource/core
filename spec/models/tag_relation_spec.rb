# == Schema Information
#
# Table name: tag_relations
#
#  id          :integer          not null, primary key
#  parent_id   :integer          not null
#  parent_type :string(255)      not null
#  child_id    :integer          not null
#  child_type  :string(255)      not null
#  weight      :integer          default(0), not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#
# Indexes
#
#  index_tag_relations_on_child_and_parent         (parent_id,parent_type,child_id,child_type) UNIQUE
#  index_tag_relations_on_child_id_and_child_type  (child_id,child_type)
#

require 'spec_helper'

describe TagRelation do
  let(:person) { create(:person) }
  let(:team)  { create(:team) }
  let(:tag)   { create(:tag) }

  it "should create relation between tag and item" do
    expect{
      create(:tag_relation, parent: team, child: tag)
    }.to change(tag.child_tag_relations, :count).by 1
  end

  # NOTE: this is database enforced, not AR enforced
  # it "should only allow one relation per item per tag" do
  #   # create first one
  #   create(:tag_relation, parent: team, child: tag)
  #
  #   # try to create 2nd one
  #   new_tag = build(:tag_relation, parent: team, child: tag)
  #   new_tag.should_not be_valid
  #   new_tag.errors.should have_key :item_id
  # end

  context "with relation" do
    let!(:relation) { create(:tag_relation, parent: team, child: tag) }

    it "should have up to date weight cache after vote creation" do
      upvotes   = create_list(:tag_vote, 10, relation: relation, value: 1)
      downvotes = create_list(:tag_vote, 5,  relation: relation, value: -1)
      expect(relation.weight).to eq(upvotes.count - downvotes.count)
    end
  end

end
