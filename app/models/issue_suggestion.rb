# == Schema Information
#
# Table name: issue_suggestions
#
#  id               :integer          not null, primary key
#  person_id        :integer          not null
#  team_id          :integer          not null
#  issue_id         :integer          not null
#  description      :text
#  created_at       :datetime
#  updated_at       :datetime
#  can_solve        :boolean          default(FALSE), not null
#  thanked_at       :datetime
#  rejected_at      :datetime
#  rejection_reason :text
#

class IssueSuggestion < ActiveRecord::Base
  attr_accessible :description, :person, :issue, :team,
                  :thanked_at, :rejected_at, :rejection_reason,
                  :suggested_bounty_amount, :can_solve

  attr_accessor :suggested_bounty_amount, :can_solve

  belongs_to :team
  belongs_to :person
  belongs_to :issue
  has_many :rewards, class_name: 'IssueSuggestionReward'

  validates :issue, presence: true
  validates :person, presence: true
  validates :team, presence: true
  validates :suggested_bounty_amount, numericality: { greater_than: 0 }, if: Proc.new { |x| x.can_solve || ![nil, 0.0].include?(x.suggested_bounty_amount) }

  scope :not_rejected, lambda { where(rejected_at: nil) }

  after_create do
    # email admins when an issue suggestion is created
    team.admins.each { |person| person.send_email(:issue_suggestion_created, issue_suggestion: self) }

    if suggested_bounty_amount.to_f > 0
      if goal = person.developer_goals.where(issue: self.issue).first
        goal.update_attributes!(amount: suggested_bounty_amount)
      else
        person.developer_goals.create!(amount: suggested_bounty_amount, issue: self.issue)
      end
    end
  end

  after_create { self.person.is_bounty_hunter!(team: issue.team) }

  def can_respond?(person)
    thanked_at.nil? && rejected_at.nil? && person && person.admin_team_ids.include?(team_id)
  end

  def thanked_reward
    rewards.sum(:amount).to_f
  end
end
