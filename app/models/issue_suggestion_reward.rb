# == Schema Information
#
# Table name: issue_suggestion_rewards
#
#  id                  :integer          not null, primary key
#  issue_suggestion_id :integer          not null
#  person_id           :integer          not null
#  amount              :decimal(10, 2)   not null
#  created_at          :datetime
#  updated_at          :datetime
#

class IssueSuggestionReward < ActiveRecord::Base

  after_create do
    if issue_suggestion.can_respond?(person)
      issue_suggestion.update_attributes!(thanked_at: Time.now)
      issue_suggestion.person.send_email(:issue_suggestion_thanked, issue_suggestion: issue_suggestion, thanked_reward: amount)
    end
  end

  attr_accessible :amount

  belongs_to :issue_suggestion
  belongs_to :person

  validates :issue_suggestion, presence: true
  validates :person, presence: true

  def account
    issue_suggestion.person.account || issue_suggestion.person.create_account
  end
end
