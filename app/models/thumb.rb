# == Schema Information
#
# Table name: thumbs
#
#  id         :integer          not null, primary key
#  person_id  :integer          not null
#  item_type  :string(255)      not null
#  item_id    :integer          not null
#  explicit   :boolean          not null
#  downvote   :boolean          not null
#  comment_id :integer
#  thumbed_at :datetime         not null
#  created_at :datetime
#  updated_at :datetime
#
# Indexes
#
#  index_thumbs_on_person_id_and_item_id_and_item_type  (person_id,item_id,item_type) UNIQUE
#

class Thumb < ActiveRecord::Base

  attr_accessible :item_id, :item_type, :item, :explicit, :downvote, :thumbed_at

  belongs_to :person
  belongs_to :item, polymorphic: true
  belongs_to :comment

  scope :up_votes, lambda { where(downvote: false) }
  scope :down_votes, lambda { where(downvote: true) }

  # def self.sync_thumbs_for_person(person)
  #   if person.github_account
  #
  #     # NOTE: this requires "notifications" scope
  #     # https://api.github.com/notifications?access_token=abcd1234
  #     #scopes   user:email,notifications,read:org
  #
  #     # repos being watched https://api.github.com/users/wkonkel/subscriptions
  #     # repos starred https://api.github.com/users/wkonkel/starred
  #
  #
  #     # scan through https://api.github.com/users/wkonkel/events/public and make sure we have all comments in our DB
  #     # what about unsubscribes? unthumbs?
  #
  #     # comments
  #     person.github_account.comments.find_each do |comment|
  #       person.thumb_ups.where(item_type: 'Issue', item_id: comment.issue_id).first_or_create!(created_at: comment.created_at)
  #     end
  #   end
  # end

end
