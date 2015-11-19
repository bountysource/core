require 'spec_helper'

describe Badge do

  shared_examples_for 'a badge' do
    before { badge.stub(:shield_svg).and_return('<such>wow</such>') }

    it 'should return xml' do
      badge.to_xml.should be_present
    end
  end

  describe 'issue' do
    let(:issue) { double(:issue, id: 1, slug: '1-slug', bounty_total: 1337) }
    let(:badge) { Badge::Issue.new(issue) }

    it_behaves_like 'a badge'
  end

  describe 'tracker' do
    before do
      badge.stub(issues: [issue])
      badge.stub(tracker: tracker)
    end

    let(:tracker) { double(:tracker, id: 1, bounty_total: 1337) }
    let(:bounty) { build(:bounty) }
    let(:badge) { Badge::Tracker.new(tracker) }
    let(:issue) { double(:issue, id: 1, slug: '1-slug', bounty_total: 1337) }

    it_behaves_like 'a badge'
  end

  describe 'team' do
    let(:person) { create(:person) }
    let(:bounty) { build(:bounty, person: person) }
    let(:team) { double(:team, id: 1, slug: 'bountysource', members: Person.all) }

    describe 'bounties posted' do
      let(:badge) { Badge::Team::BountiesPosted.new(team) }
      it_behaves_like 'a badge'
    end

    describe 'bounties on team owned projects' do
      let(:badge) { Badge::Team::BountiesReceived.new(team) }
      before { badge.stub(:bounties).and_return(Bounty.all) }
      it_behaves_like 'a badge'
    end

    describe 'money raised' do
      let(:badge) { Badge::Team::Raised.new(team) }
      before { badge.stub(:total_raised).and_return(1333337) }
      it_behaves_like 'a badge'
    end
  end

end
