require 'rails_helper'

RSpec.describe Github::BountyIntent do
  describe '.extract' do
    it 'extracts GitHub comment bounty amounts' do
      amounts = described_class.extract('Please add $+20 to this issue and +$5 more.').map(&:amount)

      expect(amounts).to eq([BigDecimal('20'), BigDecimal('5')])
    end

    it 'ignores comments without bounty amounts' do
      expect(described_class.extract('Looks good to me')).to eq([])
    end
  end

  describe '.queue_from_comment' do
    let(:person) { create(:person) }
    let(:actor) { create(:linked_account_github, person: person) }
    let(:issue) { create(:issue) }

    it 'queues a bounty in the commenter shopping cart' do
      described_class.queue_from_comment({ 'body' => '$+10' }, issue: issue, actor: actor)

      expect(person.shopping_cart.items).to include(
        hash_including('item_type' => 'Bounty', 'amount' => '10.0', 'currency' => 'USD', 'issue_id' => issue.id)
      )
    end

    it 'does not queue duplicate pending bounty intents' do
      2.times { described_class.queue_from_comment({ 'body' => '$+10' }, issue: issue, actor: actor) }

      expect(person.shopping_cart.items.count).to eq(1)
    end
  end
end
