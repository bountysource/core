# == Schema Information
#
# Table name: solutions
#
#  id              :integer          not null, primary key
#  person_id       :integer          not null
#  issue_id        :integer          not null
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  note            :text
#  url             :string(255)
#  completion_date :datetime
#  status          :string(255)      default("stopped"), not null
#
# Indexes
#
#  index_solutions_on_issue_id                (issue_id)
#  index_solutions_on_person_id               (person_id)
#  index_solutions_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

class Solution < ActiveRecord::Base
  attr_accessible :person, :issue, :url, :completion_date, :note, :status

  validates :issue, presence: true
  validates :person, presence: true
  validates_uniqueness_of :issue_id, scope: [:person_id]

  belongs_to :issue
  belongs_to :person
  has_many :solution_events, -> { order 'created_at DESC' }

  scope :active, lambda { where(status: Status::STARTED) }

  after_create :start_work
  after_create { self.person.is_bounty_hunter!(issue: self.issue) }

  module Status
    STARTED = 'started'
    STOPPED = 'stopped'
  end

  def start_work
    self.class.transaction do
      event = SolutionEvent::Started.create!(solution: self)
      self.update_attributes!(status: Status::STARTED)
      delay.notify_stakeholders(:notify_stakeholders_of_developer_work_started)

      # Updated the cached status column on Issue
      issue.update_attribute(:solution_started, true)

      event
    end
  end

  def checkin
    # to do add checking functionality. currently not used.
    SolutionEvent::CheckedIn.create!(solution: self)
  end

  def stop_work
    self.class.transaction do
      event = SolutionEvent::Stopped.create!(solution: self)
      self.update_attributes!(status: Status::STOPPED)
      delay.notify_stakeholders(:notify_stakeholders_of_developer_work_stopped)

      # Updated the cached status column on Issue
      issue.update_attribute(:solution_started, false) if issue.solutions.active.length == 0

      event
    end
  end

  def completed_work
    SolutionEvent::Completed.create!(solution: self)
  end

protected

  def notify_stakeholders(which)
    people = ((issue.developers + issue.backers) - [person]).uniq
    people.each do |person|
      person.send_email(which, solution: self)
    end
  end
end
