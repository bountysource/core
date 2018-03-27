# == Schema Information
#
# Table name: tag_votes
#
#  id              :integer          not null, primary key
#  person_id       :integer          not null
#  value           :integer          default(0), not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  tag_relation_id :integer          not null
#
# Indexes
#
#  index_tag_votes_on_tag_relation_id_and_person_id  (tag_relation_id,person_id) UNIQUE
#

class TagVote < ActiveRecord::Base
  belongs_to :tag_relation
  belongs_to :relation, class_name: 'TagRelation', foreign_key: :tag_relation_id   #legacy

  belongs_to :person

  validates :relation,  presence: true
  validates :person,    presence: true
  validates_uniqueness_of :person_id, scope: :tag_relation_id, message: 'can only create 1 vote'

  validates :value, presence: true, numericality: {
    greater_than_or_equal_to: -1,
    less_than_or_equal_to: 1
  }

  # cache weight of relation
  after_create { relation.calculate_weight }

  # cache weight of relation if value changes
  after_update { relation.calculate_weight if value_changed? }

  def self.find_or_create_by_person_and_relation_and_cast_vote(person, relation, value)
    vote = find_by person_id: person.id, tag_relation_id: relation.id

    if vote && vote.value <= 1 && vote.value >= -1
      vote.update_attributes value: vote.value += value
      vote
    else
      TagVote.create person: person, relation: relation, value: value
    end
  end

  def upvote?
    value == 1
  end

  def downvote?
    value == -1
  end

  def neutral?
    value == 0
  end

end
