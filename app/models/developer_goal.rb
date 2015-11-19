# == Schema Information
#
# Table name: developer_goals
#
#  id         :integer          not null, primary key
#  notified   :boolean          default(FALSE)
#  amount     :integer          not null
#  person_id  :integer          not null
#  issue_id   :integer          not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_developer_goals_on_issue_id                (issue_id)
#  index_developer_goals_on_person_id               (person_id)
#  index_developer_goals_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

class DeveloperGoal < ActiveRecord::Base
  belongs_to :person
  belongs_to :issue

  attr_accessible :issue, :person, :amount, :notified

  validates :person_id, presence: true
  validates :issue_id, presence: true
  validates :amount, numericality: true, presence: true
  validates_uniqueness_of :issue_id, scope: [:person_id]

  after_create :notify_backers
  after_update :update_notified_if_necessary
  after_create { self.person.is_bounty_hunter!(issue: self.issue) }

  # Invoked by Bounty after_create
  def bounty_created_callback
    # Check to see if goal met by new issue bounty total.
    # If so, email the developer, unless they have already been notified.
    if !notified? && issue.reload.bounty_total >= amount
      self.class.transaction do
        update_attributes!(notified: true)
        person.send_email(:developer_goal_reached, developer_goal: self)
      end
    end
  end

protected

  def notify_backers
    # Email backers to inform them that developer has set a goal.
    # Exclude the developer that set the goal if they are also a backer.
    (issue.backers - [person]).each do |person|
      person.send_email(:notify_backers_of_developer_goal_set, developer_goal: self)
    end
  end

  def update_notified_if_necessary
    if amount_changed?
      update_column(:notified, false)
      # place send email method here if we want to notify backers of updated developer goals
      # notify_backers
    end
  end
end
