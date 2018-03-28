# == Schema Information
#
# Table name: follow_relations
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  item_id    :integer          not null
#  item_type  :string(255)      not null
#  active     :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_follow_relations_on_person_id_and_item_id  (person_id,item_id) UNIQUE
#

require 'spec_helper'

describe FollowRelation do

  let(:person)  { create(:person) }
  let(:tracker) { create(:tracker) }

  context "with follow" do
    let!(:follow_relation) { create(:follow_relation, person: person, item: tracker) }

    it "should include tracker in followed items" do
      expect(person.followed_trackers).to include tracker
    end

    it "should not include inactive follow relations" do
      follow_relation.unfollow!
      follow_relation.reload
      expect(person.followed_trackers).not_to include tracker
    end
  end

end
