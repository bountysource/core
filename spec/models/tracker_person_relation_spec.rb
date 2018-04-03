# == Schema Information
#
# Table name: tracker_person_relations
#
#  id         :integer          not null, primary key
#  tracker_id :integer          not null
#  person_id  :integer          not null
#  can_edit   :boolean          default(TRUE), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_tracker_person_relations_on_tracker_id_and_person_id  (tracker_id,person_id) UNIQUE
#

require 'spec_helper'

describe TrackerPersonRelation do
  let(:person) { create :person }
  let(:tracker) { create :tracker }
  let(:authorized_relation) { create(:tracker_person_relation, can_edit: true, person: person, tracker: tracker) }
  let(:unauthorized_relation) { create(:tracker_person_relation, can_edit: false, person: person, tracker: tracker) }

  it "should require a person" do
    tracker_person_relation = TrackerPersonRelation.create(tracker: tracker, can_edit: true)
    expect(tracker_person_relation.errors).to have_key :person_id
  end

  it "should require a tracker" do
    tracker_person_relation = TrackerPersonRelation.create(person: person, can_edit: true)
    expect(tracker_person_relation.errors).to have_key :tracker
  end

  it "should set editing priveleges to true by default unless specified" do
    tracker_person_relation = TrackerPersonRelation.create(tracker: tracker, person: person)
    expect(tracker_person_relation.can_edit?).to eq(true)
  end

  it "should not allow duplicate TrackerPersonRelations" do
    tracker_person_relation = TrackerPersonRelation.create(tracker: tracker, person: person)
    expect {
      TrackerPersonRelation.create(tracker: tracker, person: person)
      }.not_to change(TrackerPersonRelation, :count)
  end

  describe "find or create method" do
    it "should create a new person relation for a first time editor of a tracker" do
      expect {
        TrackerPersonRelation.find_or_create(tracker, person)
      }.to change(TrackerPersonRelation, :count).by 1
    end

    it "should find (not create!) an existing person relation" do
      authorized_relation #initalize the relation
      expect {
        TrackerPersonRelation.find_or_create(tracker, person)
      }.not_to change(TrackerPersonRelation, :count)
    end
  end
end
