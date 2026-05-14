require 'spec_helper'

describe Report do
  let(:person) { create(:person) }
  let(:issue) { create(:issue) }

  it 'creates a valid report' do
    report = Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
    expect(report).to be_valid
    expect(report.status).to eq('open')
  end

  it 'validates target_type inclusion' do
    report = Report.new(reporter: person, target_type: 'Invalid', target_id: issue.id, reason: 'spam')
    expect(report).not_to be_valid
  end

  it 'validates reason inclusion' do
    report = Report.new(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'invalid')
    expect(report).not_to be_valid
  end

  it 'prevents duplicate reports from same reporter' do
    Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
    duplicate = Report.new(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
    expect(duplicate).not_to be_valid
  end

  it 'allows different users to report same target' do
    person2 = create(:person)
    Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
    report2 = Report.new(reporter: person2, target_type: 'Issue', target_id: issue.id, reason: 'harassment')
    expect(report2).to be_valid
  end

  describe 'scopes' do
    it 'filters open reports' do
      Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      Report.create!(reporter: person, target_type: 'Comment', target_id: 1, reason: 'spam', status: 'resolved')
      expect(Report.open.count).to eq(1)
    end

    it 'orders by recent' do
      r1 = Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      r2 = Report.create!(reporter: person, target_type: 'Comment', target_id: 1, reason: 'spam')
      expect(Report.recent.first).to eq(r2)
    end
  end

  describe '#target' do
    it 'returns the target object' do
      report = Report.create!(reporter: person, target_type: 'Issue', target_id: issue.id, reason: 'spam')
      expect(report.target).to eq(issue)
    end
  end
end
