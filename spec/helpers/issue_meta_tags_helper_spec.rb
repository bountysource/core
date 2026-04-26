require 'rails_helper'

RSpec.describe IssueMetaTagsHelper, type: :helper do
  describe '#title_helper' do
    let(:tracker) { double(name: 'Example Tracker') }

    it 'floors fractional open bounty totals instead of rounding up' do
      issue = double(
        bounty_total: BigDecimal('5.50'),
        tracker: tracker,
        paid_out: false
      )

      expect(helper.title_helper(issue)).to eq('$5 Bounty on Example Tracker')
    end

    it 'floors fractional paid bounty amounts instead of rounding up' do
      bounty_claim = double(amount: BigDecimal('5.50'))
      issue = double(
        bounty_total: BigDecimal('0'),
        tracker: tracker,
        paid_out: true,
        bounty_claims: double(collected: double(first: bounty_claim))
      )

      expect(helper.title_helper(issue)).to eq('A $5 Bounty has been paid out for Example Tracker')
    end
  end
end
