require 'spec_helper'

describe BadgeController do
  render_views

  let(:svg) { '<doge />' }
  before { Badge::Base.any_instance.stub(:shield_svg).and_return(svg) }

  describe 'issue' do
    let(:issue) { create(:issue) }

    it 'should render badge' do
      get :issue, issue_id: issue.id
      response.body.should eq(svg)
      expect(response.status).to eq(200)
    end

    describe 'errors' do
      describe 'record not found' do
        it 'should render error' do
          get :issue, issue_id: 'noooope'
          expect(response.status).to eq(404)
        end
      end

      describe 'missing id' do
        it 'should render error' do
          get :issue
          expect(response.status).to eq(422)
        end
      end
    end
  end

  describe 'tracker' do
    let(:tracker) { create(:tracker) }

    it 'should render badge' do
      get :tracker, tracker_id: tracker.id
      response.body.should eq(svg)
      expect(response.status).to eq(200)
    end

    describe 'errors' do
      describe 'record not found' do
        it 'should render error' do
          get :tracker, tracker_id: 'noooope'
          expect(response.status).to eq(404)
        end
      end

      describe 'missing id' do
        it 'should render error' do
          get :tracker
          expect(response.status).to eq(422)
        end
      end
    end
  end

  describe 'team' do
    let(:team) { create(:team) }
    let(:params) { { team_id: team.id } }

    shared_examples_for 'a valid team badge request' do
      it 'should render badge' do
        get :team, params
        response.body.should eq(svg)
        expect(response.status).to eq(200)
      end
    end

    describe 'bounties posted' do
      before { params.merge!(style: 'bounties_posted') }
      it_behaves_like 'a valid team badge request'
    end

    describe 'bounties received' do
      before { params.merge!(style: 'bounties_received') }
      it_behaves_like 'a valid team badge request'
    end

    describe 'money raised' do
      before { params.merge!(style: 'raised') }
      it_behaves_like 'a valid team badge request'
    end

    describe 'errors' do

      describe 'record not found' do

        it "record not found" do
          badge_factory = double()
          badge_factory.stub(:team).and_raise(ActiveRecord::RecordNotFound)
          BadgeFactory.stub(:new).and_return(badge_factory)

          get :team, params
          expect(response.status).to eq(404)
        end
      end

      describe 'Key error' do
        it "should raise" do
          badge_factory = double()
          badge_factory.stub(:team).and_raise(KeyError)
          BadgeFactory.stub(:new).and_return(badge_factory)

          get :team, params
          expect(response.status).to eq(422)
        end
      end

      describe 'parse error' do
        it "should raise" do
          badge_factory = double()
          badge_factory.stub(:team).and_raise(BadgeFactory::ParseError)
          BadgeFactory.stub(:new).and_return(badge_factory)

          get :team, params
          expect(response.status).to eq(422)
        end
      end
    end
  end

end
