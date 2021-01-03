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
#  url             :string
#  completion_date :datetime
#  status          :string           default("stopped"), not null
#
# Indexes
#
#  index_solutions_on_issue_id                (issue_id)
#  index_solutions_on_person_id               (person_id)
#  index_solutions_on_person_id_and_issue_id  (person_id,issue_id) UNIQUE
#

require 'spec_helper'

describe Solution do

  let(:person) { create :person }
  let(:issue) { create :issue }

  it "should require person" do
    solution = Solution.create(issue: issue)
    expect(solution.errors).to have_key :person
  end

  it "should require issue" do
    solution = Solution.create(person: person)
    expect(solution.errors).to have_key :issue
  end

  context "emails" do
    let!(:bounty) { create(:bounty, amount: 100, issue: issue) }
    let!(:bounty_claim) { create(:bounty_claim, issue: issue) }

    it "should notify backers when solution is created" do
      expect_any_instance_of(Solution).to receive(:start_work)
      Solution.create(issue: issue, person: person)
    end

    context "with solution" do
      let!(:solution) { create(:solution, person: person, issue: issue) }

      it "should not send emails on solution update" do
        expect(bounty.person).to receive(:send_email).never
        expect(bounty_claim.person).to receive(:send_email).never
        solution.update_attributes(person: create(:person))
      end

      it "should send emails when solution is started" do
        expect(solution).to receive(:notify_stakeholders).with(:notify_stakeholders_of_developer_work_started)
        solution.start_work
      end

      it "should send email when solution is stopped" do
        expect(solution).to receive(:notify_stakeholders).with(:notify_stakeholders_of_developer_work_stopped)
        solution.stop_work
      end

      it "should not send emails when solution receives checkin" do
        expect(solution).to receive(:notify_stakeholders).with(anything).never
        solution.checkin
      end
    end
  end

  context "with solution" do
    let!(:solution) { create :solution, person: person, issue: issue }

    it "should not allow duplicate solutions" do
      expect {
        Solution.create(issue: solution.issue, person: solution.person)
      }.not_to change(Solution, :count)
    end

    it "should have solution_events association" do
      #Testing creating events in solution_events.rb
      #merely testing that association exists
      solution.solution_events.count == 0
    end
  end

  describe "#start_work" do
    let!(:solution) { create :solution, person: person, issue: issue }

    it "should create SolutionEvent::Started" do
      expect(solution.solution_events.first.type).to eq("SolutionEvent::Started")
    end

    it "should set the status to 'started'" do
      expect(solution.status).to eq('started')
    end
  end

  describe "#stop_work" do
    let!(:solution) { create :solution, person: person, issue: issue }

    before(:each) do
      solution.stop_work
    end

    it "should create SolutionEvent::Stopped" do
      expect(solution.solution_events.first.type).to eq("SolutionEvent::Stopped")
    end

    it "should set the sstatus to 'stopped'" do
      expect(solution.status).to eq('stopped')
    end
  end
end
