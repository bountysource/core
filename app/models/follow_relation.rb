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

class FollowRelation < ActiveRecord::Base

  attr_accessible :item, :person, :active

  belongs_to :item, polymorphic: true
  belongs_to :person

  validates :item, presence: true
  validates :person, presence: true
  validates_uniqueness_of :item_id, scope: :person_id, message: 'already followed'

  scope :active, lambda { where(active: true) }

  class Error < StandardError ; end
  class InvalidItem < Error ; end

  def self.valid_item_type?(item_type)
    valid_item_classes.include?(item_type)
  end

  def self.find_item(item_type, item_id)
    if (klass = item_type.camelize.safe_constantize)
      klass.find_by_id(item_id)
    end
  end

  def follow!
    update_attribute(:active, true)
  end

  def unfollow!
    update_attribute(:active, false)
  end

protected

  def self.valid_item_classes
    Tracker::STATIC_SUBCLASSNAMES + Issue::STATIC_SUBCLASSNAMES
  end
end
