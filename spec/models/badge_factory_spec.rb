require 'spec_helper'

describe BadgeFactory do
  let(:parse_error) { BadgeFactory::ParseError }

  shared_examples_for 'the badge factory' do
    it 'should create badge' do
      badge = BadgeFactory.new(badge_params).send(type)
      expect(badge).to be_a badge_class
    end
  end

  describe 'issue badge' do
    let(:type) { :issue }
    let(:badge_class) { Badge::Issue }
    let(:model) { create(:issue) }
    let(:badge_params) { { issue_id: model.id } }
    it_behaves_like 'the badge factory'

    describe "error handling" do
      it "missing key for issue_id" do
        expect { BadgeFactory.new({}).issue }.to raise_exception(KeyError)
      end
    end
  end

  describe 'tracker badge' do
    let(:type) { :tracker }
    let(:badge_class) { Badge::Tracker }
    let(:model) { create(:tracker) }
    let(:badge_params) { { tracker_id: model.id } }
    it_behaves_like 'the badge factory'

    describe "error handling" do
      it "missing key for tracker_id" do
        expect { BadgeFactory.new({}).tracker }.to raise_exception(KeyError)
      end
    end
  end

  describe 'team badges' do
    let(:type) { :team }
    let(:model) { create(:team) }
    let(:badge_params) { { team_id: model.id } }

    describe 'bounties posted' do
      before { badge_params.merge!(style: 'bounties_posted') }
      let(:badge_class) { Badge::Team::BountiesPosted }
      it_behaves_like 'the badge factory'
    end

    describe 'bounties received' do
      before { badge_params.merge!(style: 'bounties_received') }
      let(:badge_class) { Badge::Team::BountiesReceived }
      it_behaves_like 'the badge factory'
    end

    describe 'money raised' do
      before { badge_params.merge!(style: 'raised') }
      let(:badge_class) { Badge::Team::Raised }
      it_behaves_like 'the badge factory'

    end

    describe "error handling" do
      describe "key and parse errors" do
        before do
          allow(Team).to receive(:find_by!).and_return(double())
        end

        it "bad style" do
          expect( BadgeFactory.new({team_id: 1, style: "foo"}).team ).to be_a(Badge::Team::BountiesPosted)
        end

        it "missing key for team_id" do
          expect { BadgeFactory.new({style: "foo"}).team }.to raise_exception(KeyError)
        end

        it "missing key for style" do
          expect( BadgeFactory.new({team_id: 1}).team ).to be_a(Badge::Team::BountiesPosted)
        end
      end

      it "bad team ID" do
        expect { BadgeFactory.new({team_id: 1}).team }.to raise_exception(ActiveRecord::RecordNotFound)
      end
    end

  end
end
