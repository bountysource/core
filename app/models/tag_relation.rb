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

class TagRelation < ApplicationRecord
  VALID_CLASSES = %w(Team Tag)

  belongs_to :parent, polymorphic: true
  belongs_to :child, polymorphic: true

  has_many :votes, class_name: 'TagVote'

  validates :parent, presence: true
  validates :child, presence: true
  validates :weight, presence: true

  #validates_uniqueness_of :item_id, scope: :tag_id, message: "already tagged"

  # caches weight for indexing
  def calculate_weight
    update_attribute :weight, votes.sum(:value)
    weight
  end

  # can be teams or tags
  def self.merge_two_tags(good_model, bad_model)
    raise "can't merge team into tag" if bad_model.is_a?(Team) && good_model.is_a?(Tag)

    #  merge parent votes and tags (team only)
    if bad_model.is_a?(Team)
      # delete duplicates
      bad_model.parent_tag_relations.each do |bad_tag_relation|
        if (good_tag_relation = good_model.parent_tag_relations.find_by(child_id: bad_tag_relation.child_id, child_type: bad_tag_relation.child_type))
          bad_tag_relation.votes.where(person_id: good_tag_relation.votes.pluck(:person_id)).delete_all
          bad_tag_relation.votes.update_all(tag_relation_id: good_tag_relation.id)
          bad_tag_relation.delete
        end
      end

      # actual merge
      bad_model.parent_tag_relations.update_all(parent_type: good_model.class.name, parent_id: good_model.id)
    end

    # delete duplicate child votes and tags (teams and tags)
    bad_model.child_tag_relations.each do |bad_tag_relation|
      if (good_tag_relation = good_model.child_tag_relations.find_by(parent_id: bad_tag_relation.parent_id, parent_type: bad_tag_relation.parent_type))
        bad_tag_relation.votes.where(person_id: good_tag_relation.votes.pluck(:person_id)).delete_all
        bad_tag_relation.votes.update_all(tag_relation_id: good_tag_relation.id)
        bad_tag_relation.delete
      end
    end
    bad_model.child_tag_relations.update_all(child_type: good_model.class.name, child_id: good_model.id)

    # team only
    if good_model.is_a?(Team)
      good_model.parent_tag_relations.includes(:votes).map(&:calculate_weight)
    end

    # team or tag
    good_model.child_tag_relations.includes(:votes).map(&:calculate_weight)
  end

end
