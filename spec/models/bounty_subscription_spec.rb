require 'rails_helper'

RSpec.describe BountySubscription, type: :model do
  let(:person) { create(:person) }
  let(:tracker) { create(:tracker) }
  let(:issue) { create(:issue, tracker: tracker, title: 'Fix login bug in React', body: 'React component that handles auth') }
  let(:bounty) { create(:bounty, issue: issue, amount: 150.00) }

  subject do
    described_class.new(
      person: person,
      email: person.email,
      keywords: 'login, auth',
      min_bounty_amount: 50,
      language: 'TypeScript',
      frequency: 'daily'
    )
  end

  describe 'validations' do
    it 'is valid with valid attributes' do
      expect(subject).to be_valid
    end

    it 'requires an email' do
      subject.email = nil
      expect(subject).to_not be_valid
    end

    it 'requires a valid frequency' do
      subject.frequency = 'monthly'
      expect(subject).to_not be_valid
    end
  end

  describe '#matches?' do
    it 'matches by keywords in issue title' do
      subject.keywords = 'login'
      expect(subject.matches?(bounty)).to be true
    end

    it 'rejects if keywords do not match' do
      subject.keywords = 'unrelated, something'
      expect(subject.matches?(bounty)).to be false
    end

    it 'rejects if bounty amount is below minimum' do
      subject.min_bounty_amount = 200
      expect(subject.matches?(bounty)).to be false
    end

    it 'accepts if bounty amount meets minimum' do
      subject.min_bounty_amount = 100
      expect(subject.matches?(bounty)).to be true
    end

    it 'rejects if subscription is inactive' do
      subject.active = false
      expect(subject.matches?(bounty)).to be false
    end

    it 'matches without keywords when other conditions pass' do
      subscription = described_class.new(
        person: person, email: person.email, min_bounty_amount: 100
      )
      expect(subscription.matches?(bounty)).to be true
    end
  end
end
