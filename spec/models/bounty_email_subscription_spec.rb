require 'rails_helper'

RSpec.describe BountyEmailSubscription, type: :model do
  describe '#matches?' do
    let(:person) { double('Person', id: 1, email: 'a@b.com') }
    let(:tracker) { double('Tracker', name: 'rails/rails', full_name: 'rails/rails', languages: []) }
    let(:issue) do
      double(
        'Issue',
        title: 'Fix memory leak in ActionCable',
        body: 'Users report high memory use with websocket',
        tracker: tracker
      )
    end
    let(:bounty) { double('Bounty', amount: 100, issue: issue, person_id: 99) }

    it 'matches when query tokens appear in title/body' do
      sub = described_class.new(person_id: 1, name: 'rails mem', query: 'memory actioncable', min_amount: 0)
      expect(sub.matches?(bounty)).to eq(true)
    end

    it 'rejects when min_amount not met' do
      sub = described_class.new(person_id: 1, name: 'big', query: 'memory', min_amount: 500)
      expect(sub.matches?(bounty)).to eq(false)
    end

    it 'matches min_amount when bounty is large enough' do
      sub = described_class.new(person_id: 1, name: 'ok', query: 'memory', min_amount: 50)
      expect(sub.matches?(bounty)).to eq(true)
    end

    it 'filters by tracker_name' do
      sub = described_class.new(person_id: 1, name: 'trk', query: '', min_amount: 0, tracker_name: 'rails')
      expect(sub.matches?(bounty)).to eq(true)
      sub.tracker_name = 'django'
      expect(sub.matches?(bounty)).to eq(false)
    end

    it 'returns false without issue' do
      sub = described_class.new(person_id: 1, name: 'x', query: 'x', min_amount: 0)
      expect(sub.matches?(double(issue: nil, amount: 10))).to eq(false)
    end
  end
end
